import {select, classNames, templates} from '../settings.js'; 
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';

class Product{
  constructor(id,data){
    const thisProduct = this;

    thisProduct.id = id;
    thisProduct.data = data;
    thisProduct.renderInMenu();
    thisProduct.getElements();
    thisProduct.initAccordion();
    thisProduct.initOrderForm();
    thisProduct.initAmountWidget();
    thisProduct.processOrder();
    //console.log('new Product:', thisProduct);
  }

  renderInMenu(){
    const thisProduct = this;

    /*generate HTML based on template*/
    const generatedHTML = templates.menuProduct(thisProduct.data);
    /*create elements using utils.createElementFromHTML */ 
    thisProduct.element = utils.createDOMFromHTML(generatedHTML);
    /*find menu container*/
    const menuContainer = document.querySelector(select.containerOf.menu);
    /*add element to menu*/
    menuContainer.appendChild(thisProduct.element);
  }

  getElements(){
    const thisProduct = this;

    thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
    thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
    thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
    thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
    thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
    thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
    thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
  }

  initAccordion(){
    const thisProduct = this;

    /* find the clickable trigger (the element that should react to clicking) */
    const clickableTrigger = thisProduct.accordionTrigger;
    //console.log(clickableTrigger);
    /* START: click event listener to trigger */
    clickableTrigger.addEventListener('click', function(){
      //console.log('clicked');
      /* prevent default action for event */
      event.preventDefault();
      /* toggle active class on element of thisProduct */
      thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive);
      /* find all active products */
      const allActiveProducts = document.querySelectorAll(select.all.menuProductsActive);
      //console.log(allActiveProducts);
      /* START LOOP: for each active product */
      for (let activeProduct of allActiveProducts){
        /* START: if the active product isn't the element of thisProduct */
        if (thisProduct.element != activeProduct){
        /* remove class active for the active product */
          activeProduct.classList.remove(classNames.menuProduct.wrapperActive);
        /* END: if the active product isn't the element of thisProduct */
        }
      /* END LOOP: for each active product */
      }
    /* END: click event listener to trigger */
    });
  }

  initOrderForm(){
    const thisProduct = this;
    //console.log('initOrderForm');

    thisProduct.form.addEventListener('submit', function(event){
      event.preventDefault();
      thisProduct.processOrder();
    });
    
    for(let input of thisProduct.formInputs){
      input.addEventListener('change', function(){
        thisProduct.processOrder();
      });
    }
    
    thisProduct.cartButton.addEventListener('click', function(event){
      event.preventDefault();
      thisProduct.processOrder();
      thisProduct.addToCart();
    });
  }

  processOrder(){
    const thisProduct = this;

    const formData = utils.serializeFormToObject(thisProduct.form);
    //console.log('formData: ', formData);

    thisProduct.params = {};

    let price = thisProduct.data.price;

    const allParams = thisProduct.data.params;
    
    for (const paramName in allParams){
      const param = thisProduct.data.params[paramName];

      for (const optionName in param.options){
        const option = param.options[optionName];
        const optionSelected = formData.hasOwnProperty(paramName) && formData[paramName].indexOf(optionName) > -1;

        if (optionSelected && !option.default){
          price += option.price; 

        } else if (!optionSelected && option.default){
          price -= option.price;

        }
    
        const allImages = thisProduct.imageWrapper.querySelectorAll('.'+ paramName +'-'+ optionName);

        if (optionSelected){
        
          if(!thisProduct.params[paramName]){
            thisProduct.params[paramName] = {
              label: param.label,
              options: {},
            };
          }
          thisProduct.params[paramName].options[optionName] = option.label;
          //console.log(thisProduct.params);

          for (const image of allImages){
            image.classList.add(classNames.menuProduct.imageVisible);
          }

        } else {

          for (const image of allImages){
            image.classList.remove(classNames.menuProduct.imageVisible);
          }
        }
      }
    }
    /* multiply price by amount */
    thisProduct.priceSingle = price;
    thisProduct.price = thisProduct.priceSingle * thisProduct.amountWidget.value;

    /* set the contents of thisProduct.priceElem to be the value of variable price */
    thisProduct.priceElem.innerHTML = thisProduct.price;
  }

  initAmountWidget(){
    const thisProduct = this;
    thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);

    thisProduct.amountWidgetElem.addEventListener('updated',function(){
      thisProduct.processOrder();
    });
  }

  addToCart(){
    const thisProduct = this;

    thisProduct.name = thisProduct.data.name;
    thisProduct.amount = thisProduct.amountWidget.value;

    // app.cart.add(thisProduct);

    const event = new CustomEvent('add-to-cart', {
      bubbles: true,
      detail: {
        product: thisProduct,
      },
    });

    thisProduct.element.dispatchEvent(event);
  }
}

export default Product;