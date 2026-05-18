document.addEventListener("DOMContentLoaded", () => {

  const products = [
    {
      id: 1,
      name: "قالب صيدلية داوائي",
      desc: "قالب HTML احترافي لصيدلية أو متجر أدوية - تصميم أنيق ومتجاوب مع جميع الأجهزة",
      price: 19.99,
      cat: "HTML",
      img: "https://via.placeholder.com/400x250/E33E10/fff?text=قالب+صيدلية",
      preview: "/templates/dawai-pharmacy (1).html"
    },
    {
      id: 2,
      name: "قالب متجر ملابس",
      desc: "قالب HTML لمتجر ملابس أنيق - يدعم العربية وعرض المنتجات باحترافية",
      price: 24.99,
      cat: "HTML",
      img: "https://via.placeholder.com/400x250/2196f3/fff?text=قالب+ملابس",
      preview: "/templates/my-website.html"
    }
  ];

  const uiHandler = new UIHandler();
  uiHandler.setProducts(products);
  uiHandler.loadCart();
});