# HariPicks Testing Guide

## ✅ Server Status
Your dev server is running at: **http://localhost:3000**

---

## 🧪 Test 1: Admin Panel Testing

### Navigate to Admin Panel
Open your browser and go to:
```
http://localhost:3000/admin/dashboard#haripicks
```

### Verify Page Loads
✅ Check that you see:
- **Heading**: "HariPicks Manager"
- **Subtitle**: "Manage affiliate products from Amazon, Flipkart, and more."
- **Button**: "Add New Product" (purple button in top-right)
- **Filter Sections**: 
  - Platform filters: All, Amazon, Flipkart, Other
  - Category filters: All, Electronics, Fashion, Home & Kitchen, Books, Beauty, Sports, Toys, Grocery

### Test 1.1: Create Your First Product

1. Click **"Add New Product"**
2. Fill in the form:
   ```
   Product Title: Samsung Galaxy S24 Ultra
   Description: Latest flagship smartphone with AI features
   Original Price: 124999
   Discounted Price: 99999
   Rating: 4.8
   Affiliate URL: https://amazon.in/samsung-galaxy-s24-ultra
   Platform: amazon
   Category: Electronics
   ```

3. **Upload an Image**:
   - Click on the image upload area
   - Select any product image from your computer
   - Wait for upload to complete

4. **Toggle Featured**: Click to enable "Featured" status

5. **Click**: "Publish Product"

6. **Verify**: Product appears in the grid below with:
   - Product image
   - Title
   - Prices (₹99,999 with ₹124,999 crossed out)
   - Discount badge (20% OFF)
   - Platform badge (amazon)
   - Featured badge
   - Edit and Delete buttons

### Test 1.2: Edit Product

1. Find your created product in the grid
2. Click **"Edit"** button
3. Change the title to: "Samsung Galaxy S24 Ultra 5G"
4. Click **"Update Product"**
5. Verify the title updated in the grid

### Test 1.3: Test Toggles

1. Click the **Eye icon** on your product card
   - Verify it changes to an EyeOff icon (product becomes inactive/grayscale)
2. Click again to reactivate
3. Click the **TrendingUp icon** (star icon)
   - Verify it toggles featured status
   - Featured badge appears/disappears

### Test 1.4: Test Filters

1. Click **"amazon"** in Platform filters
   - Verify only Amazon products show
2. Click **"Electronics"** in Category filters
   - Verify only Electronics products show
3. Click **"all"** in both to reset

### Test 1.5: Create More Products

Create at least 2-3 more products with different platforms and categories:

**Example 2 - Flipkart Product:**
```
Title: Nike Running Shoes
Description: Comfortable sports shoes for running
Original Price: 4999
Discounted Price: 2999
Rating: 4.5
Platform: flipkart
Category: Sports
```

**Example 3 - Fashion Product:**
```
Title: Levi's Denim Jeans
Description: Classic blue jeans
Original Price: 3999
Discounted Price: 1999
Platform: amazon
Category: Fashion
Featured: Yes
```

---

## 🌐 Test 2: Public Page Testing

### Navigate to Public HariPicks Page
```
http://localhost:3000/business/haripicks
```

### Verify Page Elements

✅ **Hero Section**:
- Gradient purple-orange background
- Large heading: "Curated Deals Just for You"
- Search bar visible
- "HariPicks" badge at top

✅ **Trending Section** (if you have featured products):
- Shows "Trending Now" heading with TrendingUp icon
- Displays featured products in a grid
- Products have "FEATURED" badge

✅ **Filters Section**:
- White card with filter buttons
- Platform filters visible
- Category filters visible

✅ **Products Grid**:
- All active products displayed
- 4 columns on desktop
- Each product card shows:
  - Image
  - Platform badge (colored)
  - Discount badge (if applicable)
  - Category tag
  - Star rating
  - Prices
  - "View Deal" button (purple gradient)

### Test 2.1: Search Functionality

1. Type "Samsung" in the search bar
2. Verify only Samsung products appear
3. Clear search and verify all products return

### Test 2.2: Filter by Platform

1. Click **"amazon"** button in Platform filters
2. Verify only Amazon products display
3. Click **"flipkart"**
4. Verify only Flipkart products display
5. Click **"all"** to reset

### Test 2.3: Filter by Category

1. Click **"Electronics"** in Category filters
2. Verify only Electronics products show
3. Test other categories

### Test 2.4: Test Affiliate Links

1. Find any product card
2. Click the **"View Deal"** button
3. Verify:
   - A new tab opens
   - The affiliate URL loads correctly
   - ⚠️ Note: The URL might show an error since these are test URLs

### Test 2.5: Verify Analytics Tracking

1. After clicking "View Deal" on a product
2. Go back to admin panel
3. Find the same product
4. Verify the **"clicks"** counter increased by 1

---

## 📱 Test 3: Navigation Testing

### Desktop Navigation

1. Go to homepage: `http://localhost:3000`
2. Look at top navigation bar
3. Hover over **"Business"** dropdown
4. Verify you see:
   - HM Snacks
   - **HariPicks** (with purple gradient "H" icon and "Curated Deals" subtitle)
   - HM Tech
5. Click **HariPicks**
6. Verify it opens the HariPicks page in a new tab

### Mobile Navigation

1. Resize browser to mobile width (< 768px) or use browser DevTools
2. Click the **hamburger menu** (three lines) in top-right
3. Scroll down to Business section
4. Verify **HariPicks** button exists with:
   - Purple gradient icon with "H"
   - Purple "DEALS" badge
5. Click it
6. Verify navigation works

---

## 🎨 Test 4: Visual/UX Testing

### Responsive Design

Test on different screen sizes:

**Desktop (1920px)**:
- Products should show 4 columns
- Hero section should be full-width
- Filters should be horizontal

**Tablet (768px)**:
- Products should show 2-3 columns
- Everything should be readable

**Mobile (375px)**:
- Products should show 1 column
- Filters should wrap to multiple rows
- Navigation should use mobile menu

### Hover Effects

On desktop, hover over:
- Product cards → should lift with shadow
- Product images → should zoom slightly
- "View Deal" button → should change color
- Filter buttons → should highlight

### Animations

- Loading spinner should show when fetching products
- Images should load smoothly
- Transitions should be smooth (no jank)

---

## 🐛 Common Issues & Solutions

### Issue: "Cannot find module" errors
**Solution**: The TypeScript compiler might need a restart. Close and reopen VSCode, or restart the dev server.

### Issue: Images not uploading
**Solution**: Check your ImageKit credentials in `.env.local` file.

### Issue: Products not showing
**Solution**: 
1. Check browser console for errors
2. Verify database table was created in Neon
3. Check API routes are working (open DevTools Network tab)

### Issue: Navigation not showing HariPicks
**Solution**: Hard refresh the page (Ctrl+Shift+R or Cmd+Shift+R)

---

## ✅ Testing Checklist

Use this to track your testing progress:

### Admin Panel
- [ ] Page loads without errors
- [ ] Can create new product
- [ ] Can upload image
- [ ] Can edit existing product
- [ ] Can delete product
- [ ] Featured toggle works
- [ ] Active/Inactive toggle works
- [ ] Platform filters work
- [ ] Category filters work
- [ ] Analytics display (views/clicks)

### Public Page
- [ ] Page loads with hero section
- [ ] Featured products show in "Trending Now"
- [ ] All products display in grid
- [ ] Search functionality works
- [ ] Platform filters work
- [ ] Category filters work
- [ ] "View Deal" button opens link
- [ ] Click tracking increments counter
- [ ] Responsive on mobile
- [ ] Responsive on tablet

### Navigation
- [ ] HariPicks in desktop Business dropdown
- [ ] HariPicks in mobile menu
- [ ] Clicking navigates to correct page
- [ ] Opens in new tab

---

## 📊 Expected Results

After completing all tests, you should have:
- ✅ 3-5 test products in your database
- ✅ Working admin panel with full CRUD
- ✅ Beautiful public page with filters
- ✅ Navigation working on desktop and mobile
- ✅ Click analytics tracking
- ✅ Responsive design on all devices

---

## 🎯 Next Steps After Testing

Once testing is complete:

1. **Add Real Products**:
   - Visit Amazon/Flipkart
   - Find products you want to promote
   - Get your affiliate links
   - Add them to HariPicks

2. **Customize Design** (Optional):
   - Adjust colors in components if needed
   - Add your own branding
   - Customize hero section text

3. **Deploy to Production**:
   - Push code to GitHub
   - Vercel will auto-deploy
   - Test on production URL

4. **Share & Monetize**:
   - Share your HariPicks page on social media
   - Add it to your email signature
   - Start earning affiliate commissions! 💰

---

**Happy Testing! 🚀**

If you encounter any issues, check the browser console (F12) for error messages and let me know what you see.
