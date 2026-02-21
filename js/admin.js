// Admin Panel Logic
(function () {
  'use strict';

  // Session timeout: auto-logout after 30 minutes of inactivity
  var SESSION_TIMEOUT = 30 * 60 * 1000;
  var sessionTimer = null;

  function resetSessionTimer() {
    if (sessionTimer) clearTimeout(sessionTimer);
    sessionTimer = setTimeout(function () {
      db.auth.signOut().then(function () {
        loginScreen.style.display = 'block';
        dashboard.style.display = 'none';
      });
    }, SESSION_TIMEOUT);
  }

  // Reset timer on user activity
  ['click', 'keydown', 'mousemove'].forEach(function (evt) {
    document.addEventListener(evt, resetSessionTimer, { passive: true });
  });

  // DOM refs
  var loginScreen = document.getElementById('login-screen');
  var dashboard = document.getElementById('admin-dashboard');
  var loginForm = document.getElementById('login-form');
  var loginError = document.getElementById('login-error');
  var adminEmail = document.getElementById('admin-email');
  var logoutBtn = document.getElementById('logout-btn');

  // Modal refs
  var modalOverlay = document.getElementById('modal-overlay');
  var modalTitle = document.getElementById('modal-title');
  var modalClose = document.getElementById('modal-close');
  var modalCancel = document.getElementById('modal-cancel');
  var modalSave = document.getElementById('modal-save');
  var itemForm = document.getElementById('item-form');
  var formError = document.getElementById('form-error');
  var formSuccess = document.getElementById('form-success');

  // Form field refs
  var formId = document.getElementById('form-id');
  var formTable = document.getElementById('form-table');
  var formTitle = document.getElementById('form-title');
  var formDescription = document.getElementById('form-description');
  var formStatus = document.getElementById('form-status');
  var formCategory = document.getElementById('form-category');
  var formImage = document.getElementById('form-image');
  var imagePreview = document.getElementById('image-preview');
  var formContent = document.getElementById('form-content');
  var formSecondaryImages = document.getElementById('form-secondary-images');
  var secondaryImagesList = document.getElementById('secondary-images-list');

  // Conditional field containers
  var fieldStatus = document.getElementById('field-status');
  var fieldCategory = document.getElementById('field-category');
  var fieldContent = document.getElementById('field-content');
  var fieldSecondaryImages = document.getElementById('field-secondary-images');

  // Modal element for width toggling
  var modalEl = document.querySelector('.modal');

  // Tab refs
  var tabs = document.querySelectorAll('.admin-tabs__tab');
  var panels = document.querySelectorAll('.admin-panel');

  // Current selected image file
  var selectedFile = null;
  // Pending secondary image files
  var pendingSecondaryFiles = [];

  // ─── Auth ───

  // Check if already logged in
  db.auth.getSession().then(function (result) {
    var session = result.data.session;
    if (session) {
      showDashboard(session.user);
    }
  });

  loginForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    loginError.style.display = 'none';

    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value;

    var { data, error } = await db.auth.signInWithPassword({
      email: email,
      password: password
    });

    if (error) {
      loginError.textContent = error.message;
      loginError.style.display = 'block';
      return;
    }

    showDashboard(data.user);
  });

  logoutBtn.addEventListener('click', async function () {
    await db.auth.signOut();
    loginScreen.style.display = 'block';
    dashboard.style.display = 'none';
  });

  function showDashboard(user) {
    loginScreen.style.display = 'none';
    dashboard.style.display = 'block';
    adminEmail.textContent = user.email;
    resetSessionTimer();
    loadTable('campaigns');
    loadTable('gallery_items');
    loadApplications();
  }

  // ─── Tabs ───

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var target = tab.getAttribute('data-tab');

      tabs.forEach(function (t) { t.classList.remove('active'); });
      tab.classList.add('active');

      panels.forEach(function (p) { p.classList.remove('active'); });

      var panelId = target === 'gallery' ? 'panel-gallery' : 'panel-' + target;
      document.getElementById(panelId).classList.add('active');
    });
  });

  // ─── Load Table Data ───

  async function loadTable(tableName) {
    var tbody = document.getElementById('table-' + tableName);
    var emptyEl = document.getElementById('empty-' + tableName);
    tbody.innerHTML = '';

    var { data, error } = await db
      .from(tableName)
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      emptyEl.style.display = 'block';
      return;
    }

    emptyEl.style.display = 'none';

    data.forEach(function (item) {
      var tr = document.createElement('tr');

      // Image column
      var imgTd = document.createElement('td');
      if (item.image_url) {
        var img = document.createElement('img');
        img.className = 'admin-table__thumb';
        img.src = item.image_url;
        img.alt = item.title || '';
        imgTd.appendChild(img);
      } else {
        imgTd.textContent = '—';
      }
      tr.appendChild(imgTd);

      // Title column
      var titleTd = document.createElement('td');
      titleTd.textContent = item.title || '';
      tr.appendChild(titleTd);

      // Description column
      var descTd = document.createElement('td');
      var desc = item.description || '';
      descTd.textContent = desc.length > 60 ? desc.substring(0, 60) + '...' : desc;
      tr.appendChild(descTd);

      // Status / Category column
      var statusTd = document.createElement('td');
      if (tableName === 'gallery_items') {
        statusTd.textContent = item.category || '—';
      } else {
        var badge = document.createElement('span');
        badge.className = 'status-badge status-badge--' + (item.status || 'draft');
        badge.textContent = item.status || 'draft';
        statusTd.appendChild(badge);
      }
      tr.appendChild(statusTd);

      // Actions column
      var actionsTd = document.createElement('td');
      actionsTd.className = 'admin-table__actions';

      var editBtn = document.createElement('button');
      editBtn.className = 'btn btn--secondary btn--small';
      editBtn.textContent = 'Edit';
      editBtn.addEventListener('click', function () {
        openModal(tableName, item);
      });

      var deleteBtn = document.createElement('button');
      deleteBtn.className = 'btn btn--danger btn--small';
      deleteBtn.textContent = 'Delete';
      deleteBtn.addEventListener('click', function () {
        deleteItem(tableName, item.id);
      });

      actionsTd.appendChild(editBtn);
      actionsTd.appendChild(deleteBtn);
      tr.appendChild(actionsTd);

      tbody.appendChild(tr);
    });
  }

  // ─── Add New Buttons ───

  document.querySelectorAll('[data-action="add"]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var table = btn.getAttribute('data-table');
      openModal(table, null);
    });
  });

  // ─── Modal ───

  function openModal(tableName, item) {
    formError.style.display = 'none';
    formSuccess.style.display = 'none';
    itemForm.reset();
    selectedFile = null;
    pendingSecondaryFiles = [];
    imagePreview.style.display = 'none';
    secondaryImagesList.innerHTML = '';

    formTable.value = tableName;

    var isCampaign = (tableName === 'campaigns');

    // Toggle wide modal for campaigns
    modalEl.classList.toggle('modal--wide', isCampaign);

    // Show/hide conditional fields
    fieldStatus.style.display = isCampaign ? 'block' : 'none';
    fieldContent.style.display = isCampaign ? 'block' : 'none';
    fieldSecondaryImages.style.display = isCampaign ? 'block' : 'none';
    fieldCategory.style.display = (tableName === 'gallery_items') ? 'block' : 'none';

    if (item) {
      // Edit mode
      modalTitle.textContent = 'Edit Item';
      formId.value = item.id;
      formTitle.value = item.title || '';
      formDescription.value = item.description || '';
      formStatus.value = item.status || 'draft';
      formCategory.value = item.category || '';
      formContent.value = item.content || '';
      if (item.image_url) {
        imagePreview.src = item.image_url;
        imagePreview.style.display = 'block';
      }
      // Load existing secondary images for campaigns
      if (isCampaign) {
        loadSecondaryImages(item.id);
      }
    } else {
      // Create mode
      modalTitle.textContent = 'Add New';
      formId.value = '';
      formContent.value = '';
    }

    modalOverlay.classList.add('active');
  }

  // Load secondary images for a campaign into the modal grid
  async function loadSecondaryImages(campaignId) {
    var { data, error } = await db
      .from('campaign_images')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('sort_order', { ascending: true });

    if (error || !data) return;

    secondaryImagesList.innerHTML = '';
    data.forEach(function (img) {
      renderSecondaryImageThumb(img.id, img.image_url);
    });
  }

  // Render a single secondary image thumbnail with delete button
  function renderSecondaryImageThumb(imageId, imageUrl) {
    var item = document.createElement('div');
    item.className = 'secondary-images-grid__item';

    var img = document.createElement('img');
    img.className = 'secondary-images-grid__img';
    img.src = imageUrl;
    img.alt = '';
    item.appendChild(img);

    var delBtn = document.createElement('button');
    delBtn.type = 'button';
    delBtn.className = 'secondary-images-grid__delete';
    delBtn.textContent = '\u00d7';
    delBtn.addEventListener('click', function () {
      deleteSecondaryImage(imageId, imageUrl, item);
    });
    item.appendChild(delBtn);

    secondaryImagesList.appendChild(item);
  }

  // Delete a secondary image from storage + database
  async function deleteSecondaryImage(imageId, imageUrl, domElement) {
    // Extract storage path from the public URL
    var storagePath = extractStoragePath(imageUrl);
    if (storagePath) {
      await db.storage.from('images').remove([storagePath]);
    }
    await db.from('campaign_images').delete().eq('id', imageId);
    domElement.remove();
  }

  // Extract the storage path from a Supabase public URL
  function extractStoragePath(url) {
    if (!url) return null;
    var marker = '/object/public/images/';
    var idx = url.indexOf(marker);
    if (idx === -1) return null;
    return url.substring(idx + marker.length);
  }

  function closeModal() {
    modalOverlay.classList.remove('active');
  }

  modalClose.addEventListener('click', closeModal);
  modalCancel.addEventListener('click', closeModal);

  modalOverlay.addEventListener('click', function (e) {
    if (e.target === modalOverlay) closeModal();
  });

  // Image file selection preview
  formImage.addEventListener('change', function (e) {
    var file = e.target.files[0];
    if (!file) return;

    selectedFile = file;
    var reader = new FileReader();
    reader.onload = function (ev) {
      imagePreview.src = ev.target.result;
      imagePreview.style.display = 'block';
    };
    reader.readAsDataURL(file);
  });

  // Secondary images file selection
  formSecondaryImages.addEventListener('change', function (e) {
    var files = Array.from(e.target.files);
    files.forEach(function (file) {
      pendingSecondaryFiles.push(file);
    });
  });

  // ─── Save ───

  modalSave.addEventListener('click', async function () {
    formError.style.display = 'none';
    formSuccess.style.display = 'none';

    var title = formTitle.value.trim();
    if (!title) {
      formError.textContent = 'Title is required.';
      formError.style.display = 'block';
      return;
    }

    modalSave.disabled = true;
    modalSave.textContent = 'Saving...';

    var tableName = formTable.value;

    // Validate table name to prevent injection
    var allowedTables = ['campaigns', 'gallery_items'];
    if (allowedTables.indexOf(tableName) === -1) {
      formError.textContent = 'Invalid table name.';
      formError.style.display = 'block';
      modalSave.disabled = false;
      modalSave.textContent = 'Save';
      return;
    }

    var id = formId.value;
    var imageUrl = null;

    // Upload image if selected
    if (selectedFile) {
      // Validate file type
      var allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (allowedTypes.indexOf(selectedFile.type) === -1) {
        formError.textContent = 'Only JPEG, PNG, GIF, and WebP images are allowed.';
        formError.style.display = 'block';
        modalSave.disabled = false;
        modalSave.textContent = 'Save';
        return;
      }

      // Validate file size (max 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        formError.textContent = 'Image must be under 5MB.';
        formError.style.display = 'block';
        modalSave.disabled = false;
        modalSave.textContent = 'Save';
        return;
      }

      var ext = selectedFile.name.split('.').pop().toLowerCase().replace(/[^a-z0-9]/g, '');
      var fileName = tableName + '/' + Date.now() + '.' + ext;

      var { data: uploadData, error: uploadError } = await db.storage
        .from('images')
        .upload(fileName, selectedFile);

      if (uploadError) {
        formError.textContent = 'Image upload failed: ' + uploadError.message;
        formError.style.display = 'block';
        modalSave.disabled = false;
        modalSave.textContent = 'Save';
        return;
      }

      var { data: urlData } = db.storage
        .from('images')
        .getPublicUrl(fileName);

      imageUrl = urlData.publicUrl;
    }

    // Build record
    var record = {
      title: title,
      description: formDescription.value.trim()
    };

    if (imageUrl) {
      record.image_url = imageUrl;
    }

    if (tableName === 'campaigns') {
      record.status = formStatus.value;
      record.content = formContent.value;
      record.updated_at = new Date().toISOString();
    }

    if (tableName === 'gallery_items') {
      record.category = formCategory.value.trim() || null;
    }

    var result;
    if (id) {
      // Update
      result = await db.from(tableName).update(record).eq('id', id);
    } else {
      // Insert
      result = await db.from(tableName).insert(record).select();
    }

    modalSave.disabled = false;
    modalSave.textContent = 'Save';

    if (result.error) {
      formError.textContent = 'Save failed: ' + result.error.message;
      formError.style.display = 'block';
      return;
    }

    // Upload secondary images for campaigns
    if (tableName === 'campaigns' && pendingSecondaryFiles.length > 0) {
      // Get the campaign ID (from edit or from newly inserted record)
      var campaignId = id;
      if (!campaignId && result.data && result.data.length > 0) {
        campaignId = result.data[0].id;
      }

      if (campaignId) {
        var allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        var timestamp = Date.now();

        for (var i = 0; i < pendingSecondaryFiles.length; i++) {
          var secFile = pendingSecondaryFiles[i];

          // Validate each file
          if (allowedTypes.indexOf(secFile.type) === -1) continue;
          if (secFile.size > 5 * 1024 * 1024) continue;

          var secExt = secFile.name.split('.').pop().toLowerCase().replace(/[^a-z0-9]/g, '');
          var secPath = 'campaigns/secondary/' + timestamp + '-' + i + '.' + secExt;

          var secUpload = await db.storage.from('images').upload(secPath, secFile);
          if (secUpload.error) continue;

          var secUrlData = db.storage.from('images').getPublicUrl(secPath);

          await db.from('campaign_images').insert({
            campaign_id: campaignId,
            image_url: secUrlData.data.publicUrl,
            sort_order: i
          });
        }
      }

      pendingSecondaryFiles = [];
    }

    closeModal();
    loadTable(tableName);
  });

  // ─── Delete ───

  async function deleteItem(tableName, id) {
    // Validate table name
    var allowedTables = ['campaigns', 'gallery_items'];
    if (allowedTables.indexOf(tableName) === -1) return;

    if (!confirm('Are you sure you want to delete this item?')) return;

    // Clean up secondary images from storage before deleting a campaign
    if (tableName === 'campaigns') {
      var { data: secImages } = await db
        .from('campaign_images')
        .select('image_url')
        .eq('campaign_id', id);

      if (secImages && secImages.length > 0) {
        var paths = secImages
          .map(function (img) { return extractStoragePath(img.image_url); })
          .filter(Boolean);
        if (paths.length > 0) {
          await db.storage.from('images').remove(paths);
        }
      }
      // Rows in campaign_images will be cascade-deleted by the FK constraint
    }

    var { error } = await db.from(tableName).delete().eq('id', id);

    if (error) {
      alert('Delete failed: ' + error.message);
      return;
    }

    loadTable(tableName);
  }

  // ─── Applications ───

  async function loadApplications() {
    var tbody = document.getElementById('table-applications');
    var emptyEl = document.getElementById('empty-applications');
    tbody.innerHTML = '';

    var { data, error } = await db
      .from('applications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      emptyEl.style.display = 'block';
      return;
    }

    emptyEl.style.display = 'none';

    data.forEach(function (item) {
      var tr = document.createElement('tr');

      // Name
      var nameTd = document.createElement('td');
      nameTd.textContent = item.name || '';
      tr.appendChild(nameTd);

      // Email
      var emailTd = document.createElement('td');
      emailTd.textContent = item.email || '';
      tr.appendChild(emailTd);

      // Type
      var typeTd = document.createElement('td');
      var typeBadge = document.createElement('span');
      typeBadge.className = 'status-badge status-badge--' + (item.type || 'distributor');
      typeBadge.textContent = item.type || '';
      typeTd.appendChild(typeBadge);
      tr.appendChild(typeTd);

      // Location
      var locTd = document.createElement('td');
      locTd.textContent = item.location || '—';
      tr.appendChild(locTd);

      // Status dropdown
      var statusTd = document.createElement('td');
      var select = document.createElement('select');
      select.className = 'app-status-select';
      ['new', 'reviewed', 'accepted', 'rejected'].forEach(function (s) {
        var opt = document.createElement('option');
        opt.value = s;
        opt.textContent = s;
        if (item.status === s) opt.selected = true;
        select.appendChild(opt);
      });
      select.addEventListener('change', function () {
        updateApplicationStatus(item.id, select.value);
      });
      statusTd.appendChild(select);
      tr.appendChild(statusTd);

      // Date
      var dateTd = document.createElement('td');
      dateTd.textContent = item.created_at ? new Date(item.created_at).toLocaleDateString() : '—';
      tr.appendChild(dateTd);

      // Actions
      var actionsTd = document.createElement('td');
      actionsTd.className = 'admin-table__actions';

      var viewBtn = document.createElement('button');
      viewBtn.className = 'btn btn--secondary btn--small';
      viewBtn.textContent = 'Message';
      viewBtn.addEventListener('click', function () {
        alert(item.message || 'No message.');
      });

      var deleteBtn = document.createElement('button');
      deleteBtn.className = 'btn btn--danger btn--small';
      deleteBtn.textContent = 'Delete';
      deleteBtn.addEventListener('click', function () {
        deleteApplication(item.id);
      });

      actionsTd.appendChild(viewBtn);
      actionsTd.appendChild(deleteBtn);
      tr.appendChild(actionsTd);

      tbody.appendChild(tr);
    });
  }

  async function updateApplicationStatus(id, status) {
    var { error } = await db
      .from('applications')
      .update({ status: status })
      .eq('id', id);

    if (error) {
      alert('Status update failed: ' + error.message);
      loadApplications();
    }
  }

  async function deleteApplication(id) {
    if (!confirm('Are you sure you want to delete this application?')) return;

    var { error } = await db.from('applications').delete().eq('id', id);

    if (error) {
      alert('Delete failed: ' + error.message);
      return;
    }

    loadApplications();
  }
})();
