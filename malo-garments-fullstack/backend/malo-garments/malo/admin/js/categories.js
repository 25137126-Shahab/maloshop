/**
 * Malo Garments — Admin Category Management
 * Add, edit, delete categories and their subcategories.
 */

document.addEventListener('DOMContentLoaded', async () => {
  if (!AdminApp.initAdminPage('categories.html', 'Category Management')) return;

  await renderCategoriesTable();
  bindCategoryEvents();
});

async function renderCategoriesTable() {
  const [categories, products] = await Promise.all([
    MaloStore.getCategories(),
    MaloStore.getProducts()
  ]);
  const tbody = document.getElementById('categoriesTableBody');

  if (categories.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color: var(--text-muted); padding: var(--sp-xl);">No categories yet.</td></tr>`;
    return;
  }

  tbody.innerHTML = categories.map(cat => `
    <tr>
      <td><img src="${cat.image}" class="admin-table-thumb" alt="${cat.name}" /></td>
      <td><strong>${cat.name}</strong></td>
      <td>${cat.slug}</td>
      <td>${cat.subcategories.length ? cat.subcategories.map(s => s.name).join(', ') : '—'}</td>
      <td>${products.filter(p => p.category === cat.id).length}</td>
      <td>
        <div class="admin-table-actions">
          <button class="admin-icon-btn edit-cat-btn" data-id="${cat.id}" title="Edit">✎</button>
          <button class="admin-icon-btn danger delete-cat-btn" data-id="${cat.id}" title="Delete">🗑</button>
        </div>
      </td>
    </tr>
  `).join('');

  document.querySelectorAll('.edit-cat-btn').forEach(btn => {
    btn.addEventListener('click', () => openCategoryModal(btn.dataset.id));
  });
  document.querySelectorAll('.delete-cat-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const cat = categories.find(c => c.id === btn.dataset.id);
      const productCount = products.filter(p => p.category === cat.id).length;
      if (productCount > 0) {
        MaloApp.showToast(`Cannot delete — ${productCount} product(s) still use this category.`, 'error');
        return;
      }
      if (confirm(`Delete "${cat.name}"?`)) {
        try {
          await MaloStore.deleteCategory(cat.id);
          MaloApp.showToast('Category deleted.', 'info');
          renderCategoriesTable();
        } catch (err) {
          MaloApp.showToast(err.message || 'Failed to delete category.', 'error');
        }
      }
    });
  });
}

function bindCategoryEvents() {
  document.getElementById('addCategoryBtn').addEventListener('click', () => openCategoryModal(null));
  document.getElementById('closeCategoryModal').addEventListener('click', closeCategoryModal);
  document.getElementById('categoryModalOverlay').addEventListener('click', (e) => {
    if (e.target.id === 'categoryModalOverlay') closeCategoryModal();
  });

  document.getElementById('categoryForm').addEventListener('submit', (e) => {
    e.preventDefault();
    saveCategoryFromForm();
  });
}

async function openCategoryModal(id) {
  document.getElementById('categoryForm').reset();

  if (id) {
    const cat = await MaloStore.getCategoryById(id);
    document.getElementById('categoryModalTitle').textContent = 'Edit Category';
    document.getElementById('categoryId').value = cat.id;
    document.getElementById('catName').value = cat.name;
    document.getElementById('catSlug').value = cat.slug;
    document.getElementById('catImage').value = cat.image;
    document.getElementById('catSubcategories').value = cat.subcategories.map(s => s.name).join(', ');
  } else {
    document.getElementById('categoryModalTitle').textContent = 'Add Category';
    document.getElementById('categoryId').value = '';
  }

  document.getElementById('categoryModalOverlay').classList.add('active');
}

function closeCategoryModal() {
  document.getElementById('categoryModalOverlay').classList.remove('active');
}

async function saveCategoryFromForm() {
  const id = document.getElementById('categoryId').value;
  const existing = id ? await MaloStore.getCategoryById(id) : null;

  const subNames = document.getElementById('catSubcategories').value.split(',').map(s => s.trim()).filter(Boolean);
  const subcategories = subNames.map(name => {
    const existingSub = existing?.subcategories.find(s => s.name === name);
    return existingSub || { id: MaloStore.generateId('sub'), name, slug: name.toLowerCase().replace(/\s+/g, '-') };
  });

  const category = {
    id: id || undefined,
    name: document.getElementById('catName').value.trim(),
    slug: document.getElementById('catSlug').value.trim(),
    image: document.getElementById('catImage').value.trim(),
    subcategories
  };

  try {
    await MaloStore.saveCategory(category);
    MaloApp.showToast(id ? 'Category updated! ✓' : 'Category added! ✓', 'success');
    closeCategoryModal();
    renderCategoriesTable();
  } catch (err) {
    MaloApp.showToast(err.message || 'Failed to save category.', 'error');
  }
}
