// Initialize UI Handler
document.addEventListener("DOMContentLoaded", () => {
  // Create UI Handler instance
  const uiHandler = new UIHandler();

  // Set initial products data
  const products = [
    {id:1,name:"القالب الأول",desc:"قالب HTML احترافي مع تصميم متجاوب",price:19.99,cat:"HTML",img:"https://via.placeholder.com/300x200"},
    {id:2,name:"القالب الثاني",desc:"قالب CSS حديث مع تأثيرات مذهلة",price:24.99,cat:"CSS",img:"https://via.placeholder.com/300x200"},
    {id:3,name:"القالب الثالث",desc:"قالب HTML متكامل مع ميزات متقدمة",price:29.99,cat:"HTML",img:"https://via.placeholder.com/300x200"}
  ];

  // Initialize UI
  uiHandler.setProducts(products);
  uiHandler.renderProducts(products);
  uiHandler.loadCart();
});
