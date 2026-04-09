import { supabase } from '../lib/supabase';

// =========================================================================
// AUTHENTICATION
// =========================================================================

export const loginAdmin = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) {
    console.error('Error logging in:', error.message);
    throw error;
  }
  return data.user;
};

export const logoutAdmin = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Error logging out:', error.message);
    throw error;
  }
};

export const subscribeToAuthChanges = (callback) => {
  // Fire initially with the current user
  supabase.auth.getUser().then(({ data: { user } }) => {
    callback(user);
  });

  // Listen to changes
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (event, session) => {
      callback(session?.user || null);
    }
  );

  return () => {
    subscription.unsubscribe();
  };
};

// =========================================================================
// PRODUCTS (Maps category_id <-> categoryId, created_at <-> createdAt)
// =========================================================================

export const getProducts = async () => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }

  // Map to frontend expectations
  return data.map((item) => ({
    id: item.id,
    name: item.name,
    price: item.price,
    categoryId: item.category_id,
    description: item.description || '',
    materialNote: item.material_note || '',
    images: item.images || [],
    featured: item.featured || false,
    active: item.active !== false,
  }));
};

export const addProduct = async (productData) => {
  const payload = {
    name: productData.name,
    price: Number(productData.price),
    category_id: productData.categoryId,
    description: productData.description || '',
    material_note: productData.materialNote || '',
    images: productData.images || [],
    featured: productData.featured || false,
    active: productData.active !== false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('products')
    .insert([payload])
    .select('id')
    .single();

  if (error) {
    console.error('Error adding product:', error);
    throw error;
  }
  return data.id;
};

export const updateProduct = async (id, productData) => {
  const payload = {
    updated_at: new Date().toISOString()
  };
  
  // Optionally include fields that exist in productData
  if (productData.name !== undefined) payload.name = productData.name;
  if (productData.price !== undefined) payload.price = Number(productData.price);
  if (productData.categoryId !== undefined) payload.category_id = productData.categoryId;
  if (productData.description !== undefined) payload.description = productData.description;
  if (productData.materialNote !== undefined) payload.material_note = productData.materialNote;
  if (productData.images !== undefined) payload.images = productData.images;
  if (productData.featured !== undefined) payload.featured = productData.featured;
  if (productData.active !== undefined) payload.active = productData.active;

  const { error } = await supabase
    .from('products')
    .update(payload)
    .eq('id', id);

  if (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};

export const deleteProduct = async (id) => {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};

// =========================================================================
// CATEGORIES
// =========================================================================

export const getCategories = async () => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('order', { ascending: true });

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }

  return data.map(cat => ({
    id: cat.id,
    name: cat.name,
    order: cat.order,
    active: cat.active !== false,
  }));
};

export const addCategory = async (catData) => {
  const payload = {
    name: catData.name,
    order: catData.order || 0,
    active: catData.active !== false,
    created_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('categories')
    .insert([payload])
    .select('id')
    .single();

  if (error) {
    console.error('Error adding category:', error);
    throw error;
  }
  return data.id;
};

export const updateCategory = async (id, catData) => {
  const { error } = await supabase
    .from('categories')
    .update(catData)
    .eq('id', id);

  if (error) {
    console.error('Error updating category:', error);
    throw error;
  }
};

export const deleteCategory = async (id) => {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
};

export const updateCategoriesOrder = async (orderedCategories) => {
  // Supabase doesn't have a single bulk update out of the box if ids vary,
  // mapping them into sequential updates
  const promises = orderedCategories.map((cat, idx) => 
    supabase
      .from('categories')
      .update({ order: idx + 1 })
      .eq('id', cat.id)
  );

  const results = await Promise.allSettled(promises);
  results.forEach(res => {
    if (res.status === 'rejected' || res.value.error) {
      console.error('Error updating category order:', res);
    }
  });
};

// =========================================================================
// SETTINGS
// =========================================================================

export const getSettings = async () => {
  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .eq('id', 1)
    .single();

  if (error) {
    console.error('Error fetching settings:', error);
    return null;
  }
  
  return {
    whatsappNumber: data.whatsapp_number || '',
    featuredSectionLabel: data.featured_section_label || '',
    brandTagline: data.brand_tagline || '',
    instagramHandle: data.instagram_handle || ''
  };
};

export const updateSettings = async (settingsData) => {
  const payload = {};
  if (settingsData.whatsappNumber !== undefined) payload.whatsapp_number = settingsData.whatsappNumber;
  if (settingsData.featuredSectionLabel !== undefined) payload.featured_section_label = settingsData.featuredSectionLabel;
  if (settingsData.brandTagline !== undefined) payload.brand_tagline = settingsData.brandTagline;
  if (settingsData.instagramHandle !== undefined) payload.instagram_handle = settingsData.instagramHandle;

  // Assume id=1 is the only settings row
  const { error } = await supabase
    .from('settings')
    .update(payload)
    .eq('id', 1);

  if (error) {
    // If updating fails because the row doesn't exist, try upserting
    const { error: upsertError } = await supabase
      .from('settings')
      .upsert({ ...payload, id: 1 });
      
    if (upsertError) {
      console.error('Error saving settings:', upsertError);
      throw upsertError;
    }
  }
};

export const subscribeToSettings = (callback) => {
  // Fire initially with current settings
  getSettings().then(callback);

  // Optional: setup realtime channel for 'settings' table here
  // Returning a noop for now as it mirrors the existing mock subscription
  return () => {};
};

// =========================================================================
// STORAGE
// =========================================================================

export const uploadProductImage = async (file, productId) => {
  // Use a unique filename
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random()}.${fileExt}`;
  const filePath = `${productId}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('products')
    .upload(filePath, file);

  if (uploadError) {
    console.error('Error uploading image:', uploadError);
    throw uploadError;
  }

  // Get public URL
  const { data } = supabase.storage
    .from('products')
    .getPublicUrl(filePath);

  return data.publicUrl;
};

export const deleteImageByUrl = async (url) => {
  if (!url) return;
  try {
    // Extract file path from Supabase storage URL
    // e.g. "https://xxxx.supabase.co/storage/v1/object/public/products/xyz/123.jpg"
    const bucketStr = '/object/public/products/';
    const pathIndex = url.indexOf(bucketStr);
    
    if (pathIndex !== -1) {
      const filePath = url.substring(pathIndex + bucketStr.length);
      const { error } = await supabase.storage
        .from('products')
        .remove([filePath]);
        
      if (error) throw error;
    }
  } catch (error) {
    console.error('Error deleting image:', error);
  }
};
