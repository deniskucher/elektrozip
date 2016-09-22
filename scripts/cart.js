(function( $ ) {
$.widget('alexb.cart', {

	options: {
        config: {'clearAfterSend':true, 'showAfterAdd':false},
		name : "Наименование",
		price : "Цена",
		all : "Сумма",
		order : "Оформить заказ",
		basket : "Ваша корзина",
		num : "Кол-во",
		send : "Спасибо за покупку!\nМы свяжемся с Вами в ближайшее время",
		goods : "Товаров",
		amount : "Сумма",
		widjetObj: null,
		cardID:"",
		DATA: {},
		IDS: [],
		CONFIG:{},
		orderId:null,
		usdRate:null,
		cartfixed:false,
	},

	_create: function () {
        var widget = this;
		$(widget.element).append("\<span class = 'basket'></span>\
		<div class='priceinbasket'><span id='basketwidjet'></span></div>\
		");
		widget.addbasketfixed();
		$(document).on('scroll', function(event) { widget.showfixedcart('.top-info-block')});

		$('body').on('click', '.buttonaddtoCart', function() { widget.addcartorderitems($(this).data('id'), $(this).next().val()); });
			
		$('body').on('click', '.add10', function() {widget.addcartorderitems($(this).data('id'), $(this).val().substr(1)); });

		$('body').on('click', '.add100', function() { widget.addcartorderitems($(this).data('id'), $(this).val().substr(1)); });

		$('body').on('click', '.basket,.priceinbasket', function(event) { event.preventDefault();
		widget.getorderitems(widget.options.orderId);
		widget.renderBasketTable(); 
		widget.showWindow('bcontainer', 1);});
		
		$('body').on('click', '#formmail', function(event) { event.preventDefault();
		widget.formtomail(); widget.showWindow('order', 1);});
		
		$('body').on('click', '#but_send', function(event) { event.preventDefault();
		widget.checkout();});
		
		$('body').on('click', '#bclose', function(event) { event.preventDefault();
		widget.closeWindow('bcontainer', 1)});
		
		$('body').on('click', '#bclosecontinue', function(event) { event.preventDefault();
		widget.closeWindow('bcontainer', 1)});

		$('body').on('click', '.bcloseitem', function(event) {
			if(confirm('Удалить позицию?')){
				widget.delItem($(this).data('id'));	
			}
			else{
				event.preventDefault();
			}
		});
		
		$('body').on('click', '#closeformtomail', function(event) { event.preventDefault();
		widget.closeWindow('order', 0)});

		$('body').on('keydown', '.num', function(event) { 
			var cartItemID =  $(this).attr("id").substr(11);
	    	if (event.keyCode == 13){
	    		widget.inputrenderBasketTable($(this).val(), cartItemID);	
	    	}
		});

		$('body').on('blur', '.num', function(event) { 
			if (+$(this).val() < 1) {
				$(this).val(1);
				event.preventDefault();
			};
	    	var cartItemID =  $(this).attr("id").substr(11);
	    	widget.inputrenderBasketTable($(this).val(), cartItemID);	
	    				
		});  

		$('body').on('click', '.btn-minus', function() {
			var cartItemID =  $(this).attr("name").substr(6);
			var q = $(this).val().substr(1);
			widget.dekrimentOrderItems(q, cartItemID);
		});

		$('body').on('click', '.btn-plus', function() {
			var cartItemID =  $(this).attr("name").substr(5);
			var q = $(this).val().substr(1);
			widget.inkrimentOrderItems(q, cartItemID);
		});

		$('body').on('click', '.quantity-up', function() {
			var cartItemID =  $(this).attr("id").substr(5);
			widget.inkrimentOrderItems(1, cartItemID);
		});
		
		$('body').on('click', '.quantity-down', function() {
			var cartItemID =  $(this).attr("id").substr(6);
			widget.dekrimentOrderItems(1, cartItemID);
		});

		$('body').on('keyup', '.numpage, .num', function(event) {
			
			var i= $(this).val().length;
			i=(i==0)? 1: i;
			$(this).css('width',i*4+66+'px');
		});

	
		widget._init('basketwidjet', widget.options.config);
	},
		
	_init: function(widjetID, config){
		var widget = this;	
		widget.options.config = config || {};
		
		try {
			widget.options.orderId = JSON.parse(localStorage.getItem("orderId")); 
			if (widget.options.orderId == null)
				{
				widget.options.orderId = null;
				}	
			} 
			catch (e) 
			{
			widget.options.orderId = null;
			}

		widget.options.cardID = "basketwidjet";

		widget.getorderitems(widget.options.orderId);
		widget.options.widjetObj = $("#" + "basketwidjet");
		if (widget.isEmptyObject(widget.options.DATA))
		widget.reCalc();	
	},
	
	addToCart: function(id, name, price, price_usd, code, photo, _kol)
	{
		var widget = this;
		var kol = +_kol;
		
		if ( $("input").is("#" + wiNumInputPrefID + id) )
			{
			kol = parseInt( $("#" + wiNumInputPrefID + id).val() );	
			}
			
		id = ( $.isNumeric(id) ) ? id.toString() : id;
	
		var id_ = id;		
	 
		var goodieLine = {"id" : id_, "name" : name, "price": price, "price_usd": price_usd, "code": code, "num" : kol, "url" : document.location.href, "photo" : photo, "usdRate": null};
	
		if (widget.isEmptyObject(widget.options.DATA))
			{
			widget.options.DATA[id_] = goodieLine;	
			widget.options.IDS.push(id_);
			}
		else
			for(var idkey in widget.options.DATA) 
				{	
					if($.inArray(id_, widget.options.IDS) === -1)
					{
						widget.options.DATA[id_] = goodieLine;
						widget.options.IDS.push(id_)
					}
					else	
					if (idkey == id_)
					{
						widget.options.DATA[idkey].num = kol;	
					}
				}
		
		widget.reCalc();
	
		if (widget.options.config.showAfterAdd)
		{
			widget.showWindow('bcontainer', 1);
		}
	},

	reCalc: function()
	{
		var widget = this;	
		var num = 0;
		var sum = 0;
		var sum_usd =0;		
		for(var idkey in widget.options.DATA) 
		{
			num += parseInt(widget.options.DATA[idkey].num);
			sum += parseFloat(parseInt(widget.options.DATA[idkey].num) * parseFloat(widget.options.DATA[idkey].price_usd * widget.options.usdRate));
			sum_usd+= parseFloat(parseInt(widget.options.DATA[idkey].num) * parseFloat(widget.options.DATA[idkey].price_usd));
		}
				
		widget.options.widjetObj.html(widget.options.goods + " " + num +" шт." +"<br>"+" " + widget.options.amount + " " +"$"+sum_usd.toFixed(2)+ " ("+sum.toFixed(2) + " грн)"+"<br>"+"Открыть корзину");
		$('#basketwidjetfixed').html(num +" шт.");
		
	},

	clearBasket: function()
	{
		var widget = this;
		widget.options.orderId = null;
		widget.options.DATA = {};	
		widget.options.IDS = [];
		widget.options.widjetObj.html(widget.options.goods + " " + "0 шт." +"<br>"+" " + widget.options.amount + " " + "$0.00 (0.00 грн)"+"<br>"+"Открыть корзину");	
		$('#basketwidjetfixed').html("0 шт.");
		$("#btable").html('');
		$("#order").remove();
		$("#bcontainer").remove();
		$("#blindLayer").remove();
		localStorage.removeItem('id_client');
		localStorage.removeItem('orderId');
	},		
	
 	renderBasketTable: function(){
		var widget = this;
		widget.reCalc();
		if ($('#bcontainer').length == 0)
		{		
			$("body").append(" \
				<div id='blindLayer' class='blindLayer'></div> \
				<div id='bcontainer' class='bcontainer'> \
				<div id='bsubject'><h1>" + widget.options.basket + "</h1></div>\
				<span id='bclose' title='Закрыть корзину'><h1>[Закрыть]</h1></span>\
				<div id='usdRate'>Курс доллара: <b><span class='usdRate'></span></b></div>\
				<div class='space'></div>\
				<table id='bcaption'><tr><td>Код товара</td><td>" + widget.options.name + "</td><td>" + widget.options.price + "</td><td>" + widget.options.num + "</td><td>" + widget.options.all + "</td><td></td></tr></table> \
				<div id='overflw'><table class='btable' id='btable'></table><div class='emptybasket'></div></div>\
				<div id='bfooter'> <span id='bsum'>...</span><button id='formmail' class='btn btn-primary btn-large' >" + "<b>"+widget.options.order + "</b>"+"</button>\
				<button id='bclosecontinue' class='btn btn-large'>" + "<b>Продолжить покупки</b>"+"</button></div>\
				</div> \
			");	
			
		}
		else 
		{
			$("#btable").html("");	
		}
		if (widget.isEmptyObject(widget.options.DATA)) {
			$('.emptybasket').html('');
			$('.usdRate').text('');
			$('.emptybasket').append(
				$('<div/>').text('Ваша корзина пуста!')
			);
			$('#formmail').attr('disabled','disabled');
		}
		else{
			$('.emptybasket').html('');
			$('#formmail').removeAttr('disabled');
			$('.usdRate').text(widget.options.usdRate.toFixed(2));
			console.log(widget.options.usdRate.toFixed(2));
		}	
		var items = [];
		
		for(var idkey in widget.options.DATA) 
		{
			items.push(idkey);
		}
		items.sort();
		for(var key = 0; key<items.length; key++){
			var itemid = items[key];
			//}
			with (widget.options.DATA[itemid])
			{
				var usdRate = widget.options.usdRate;
				var productLine = '<tr class="bitem" id="wigoodline-' + id + '"> \
		 			<td><img src="'+photo+'" alt = '+name+' title='+name+'>' +'<br>'+ code +'</td> \
		 			<td><a href="' + url + '">' + name +'</a></td> \
		 			<td id="lineprice_' + id + '"class="wigoodprice">' + '$'+ parseFloat(price_usd).toFixed(2) +' ('+ (price_usd * usdRate).toFixed(2) +' грн)</td> \
		 			<td> \
		 			<div class="input-prepend input-append">\
		 			<!--<input type="button" class="btn btn-minus" name="minus_'+id+'" class="input-mini" value="-100">\
                    <input type="button" class="btn btn-minus" name="minus_'+id+'" class="input-mini" value="-10">-->\
                    <div class="quantity">\
                    <input type="number" id="basket_num_' + id + '" class="input-mini num" min="1" max="10000" value='+num+' name="num">\
                    <div class="quantity-nav">\
                    <div class="quantity-button quantity-up" id="plus_'+id+'">+</div>\
                    <div class="quantity-button quantity-down" id="minus_'+id+'">-</div>\
                    <!--<input type="button" class="btn btn-plus" name="plus_'+id+'" class="input-mini" value="+10">\
                    <input type="button" class="btn btn-plus" name="plus_'+id+'" class="input-mini" value="+100">-->\
                    </div>\
                    </td>\
		 			<td id="linesum_' + id + '">'+ '$'+parseFloat(price_usd * num).toFixed(2)+' ('+parseFloat(price_usd * num * usdRate).toFixed(2) +' грн)</td>\
		 			<td class="bcloseitem" data-id='+ id +' title="Удалить позицию"></td> \
		 			</tr>';	
			}
			$("#btable").append(productLine);
			
			$(".basket_num_buttons").data("min-value");
		}

		widget.sumAll();	
		
	},

	inkrimentOrderItems: function(num, productID)
	{
		var widget = this;
		var cartItemID = productID;
		var cartNum = parseInt($("#basket_num_" + cartItemID).val());
		var q = +num;
		var cartNum = (cartNum < 1000000) ? cartNum + q : 1000000;
		widget.options.DATA[cartItemID].num = cartNum;
		$("#basket_num_" + cartItemID).val(cartNum);
		widget.sumAll();
		widget.reCalc();
		widget.addcartorderitems(cartItemID, cartNum, true);
		widget.renderBasketTable();
	},

	dekrimentOrderItems: function(num, productID)
	{
		var widget = this;
		var cartItemID = productID;
		var cartNum = parseInt($("#basket_num_" + cartItemID).val());
		var q = +num;
		var cartNum = (cartNum > q) ? cartNum - q : 1;
		widget.options.DATA[cartItemID].num = cartNum;
		$("#basket_num_" + cartItemID).val(cartNum);
		widget.sumAll();
		widget.reCalc();
		widget.addcartorderitems(cartItemID, cartNum, true);
		widget.renderBasketTable();
	},

	inputrenderBasketTable: function(num, productID)
	{
		var widget = this;
		var cartItemID = productID;
		var cartNum = +num;
		widget.options.DATA[cartItemID].num = cartNum;
		widget.sumAll();
		widget.reCalc();
		widget.addcartorderitems(cartItemID, cartNum, true);
		widget.renderBasketTable();
	},


	sumAll: function()
	{
		var widget = this;
		var sum = 0;
		var sum_usd = 0;
		for(var idkey in widget.options.DATA) { 
			sum += parseFloat(widget.options.DATA[idkey].price_usd * widget.options.DATA[idkey].num * widget.options.usdRate);
			sum_usd += parseFloat(widget.options.DATA[idkey].price_usd * widget.options.DATA[idkey].num);
		}
		$("#bsum").html("<b>Итого</b>: " + '$'+sum_usd.toFixed(2)+' ('+sum.toFixed(2) + " грн)");	
	},

	showWindow: function(win, blind)
	{
		$("#" + win).fadeIn(200);
		if (blind)
		$("#blindLayer").fadeIn(200);	
	},
		
	closeWindow: function(win, blind)
	{
		$("#" + win).fadeOut(200);
		$("#" + win).hide();
		if (blind)
		$("#blindLayer").fadeOut(200);	
	},
	
	delItem: function(id)
	{
		var widget = this;		
		sendRequest({
			action: 'cart2.delorderitemsfrompage',
	        data: {product_id: id, order_id: widget.options.orderId},
	        successHandler: function (_callbackParams) {
	            var response = _callbackParams.response;
				if (!response.success)
	            	alert(response.message);
				
	        }
	    });
		
		$("#btable").html("");	
		delete widget.options.DATA[id];
		widget.options.IDS.splice( $.inArray(id, widget.options.IDS), 1 );
		widget.reCalc();
		widget.renderBasketTable();
		
		if (widget.options.IDS.length == 0)
		{
			widget.options.widjetObj = $("#" + "basketwidjet");
	    	widget.options.widjetObj.html(widget.options.goods + " " + "0 шт." +"<br>"+ " " + widget.options.amount + " " + "$0.00 (0.00 грн)"+"<br>"+"Открыть корзину");
	    	$('#basketwidjetfixed').html("0 шт.");
		}
	},	
	
	getForm: function (formId)
	{
		var formObj = document.getElementById(formId);
		var copyForm = formObj.cloneNode(true);
		INPUTS=[].slice.call( copyForm.querySelectorAll("input,textarea") );
		INPUTS.forEach(function(elm)
		{
			if  ( (elm.tagName == 'INPUT') && ((elm.type == 'text') || (elm.type == 'hidden')) )	
			{	
				var subjP = document.createElement('b');
					subjP.innerHTML = elm.placeholder;	
				elm.parentNode.insertBefore(subjP, elm);
				var spanReplace = document.createElement("div");
				spanReplace.innerHTML = elm.value;	
				elm.parentNode.replaceChild(spanReplace, elm);	
			}
			else 
			if (elm.tagName == 'TEXTAREA')
			{
				var subjP = document.createElement('b');
				subjP.innerHTML = elm.placeholder;	
				elm.parentNode.insertBefore(subjP, elm);
				var spanReplace = document.createElement("div");
				spanReplace.innerHTML = $("#" + elm.id).val();	
				elm.parentNode.replaceChild(spanReplace, elm);		
			}
		});
		return copyForm.innerHTML;
	},

	addcartorderitems: function(_product_id, _num, _update)	
	{
		var widget = this;
		var num = _num||1;
		
		widget.options.orderId = JSON.parse(localStorage.getItem("orderId"));
        sendRequest({
            action: 'cart2.addcartorderitems',
            data: {product_id: _product_id, order_id: widget.options.orderId, num: _num, add: true, update: _update},
            successHandler: function (_callbackParams) {
                var response = _callbackParams.response;
                if (!response.success)
                    alert(response.message);
				else {
					widget.options.orderId = response.data.id;
					var order = response.data.order;
					widget.options.usdRate = order.usdRate;
					
					localStorage.setItem('orderId', JSON.stringify(response.data.id));
					if (_update == null) {
						widget.formmodal();
						$myModal = $('#myModal');
				        $myModal.modal('show');
	                    
	                    setTimeout(function() {
	                        $myModal.modal('hide');
	                    },3000);
					};
					
                    widget.getorderitems(widget.options.orderId);
                }
            }
        });
	},

	getorderitems: function(_orderId)	
	{
		var widget = this;
		sendRequest({
            action: 'cart2.getorderitems',
            data: {id: _orderId},
            successHandler: function (_callbackParams) {
                var response = _callbackParams.response;
                if (!response.success){
                	widget.options.widjetObj.html(widget.options.goods + " " + "0 шт." +"<br>"+" " + widget.options.amount + " " + "$0.00 (0.00 грн)"+"<br>"+"Открыть корзину");
                	$('#basketwidjetfixed').html("0 шт.");
                }
                else {
					var order = response.data.order;
					var items = order.items;
					for (var i = 0, len = items.length; i < len; i++) {
                    	var item = items[i];
                    	widget.addToCart(item.code, item.name, item.price, item.price, item.code, item.img, item.requiredQuantity);
                	}
					widget.options.usdRate = +order.usdRate;
					widget.reCalc();
				}
            }
        });
	},

	checkout: function()
	{
		var widget = this;
		var fio = $("#fio").val();
		var phone = $("#phone").val();
		var email = $("#email").val();
		
		sendRequest({
            action: 'cart2.checkoutorder',
            data: {name: fio, phone: phone, email: email, orderid: widget.options.orderId},
            successHandler: function (_callbackParams) {
                var response = _callbackParams.response;
                $('#order').find('.err').removeClass('err').html('');
                if (!response.success){
                	var errors = JSON.parse(response.message);
                	for(var err in errors) {
						console.log(errors[err]);
                    	$('#order').find('#' + err).next().show().addClass('err').text(errors[err]);
                	}
                }
                else {
                	$('.error-form').removeClass('err');
					$('.error-form').hide();
					widget.closeWindow("bcontainer", 1);	
					widget.closeWindow("order", 0);
					alert(widget.options.send);
					widget.clearBasket();
				}
			}
		});
	},
	
	formtomail: function(){
		if(document.getElementById('order')==null){	
			$("body").append(
				$('<div/>',{id: 'order',class: 'popup'}).append(
	                $('<span/>',{id:'closeformtomail'}).text('[закрыть]'),
	                $('<h4/>').text('Введите ваши контактные данные'),
	                $('<div/>',{class:'form-block'}).append(
	                    $('<form/>',{id:'formToSend',role:'form'}).append(
	                    	$('<div/>').append(
		                        $('<input/>', {type: 'text', id: 'fio', name: 'fio', class:'text-input'}).attr('placeholder','Имя'),
		                        $('<span/>',{class:'error-form'})    
	                        ),
	                        $('<div/>').append(
	                        $('<input/>', {type: 'text', id: 'phone', name: 'phone', class:'text-input'}).attr('placeholder','Телефон'),
	                        $('<span/>',{class:'error-form'})
	                        ),
	                        $('<div/>').append(
	                        $('<input/>', {type: 'text', id: 'email', name: 'email', class:'text-input'}).attr('placeholder','E-mail')
	                        ),
	                        $('<span/>',{class:'error-form'}),
	                        $('<button/>', {type: 'submit', id: 'but_send', class:'btn btn-default'}).text('Отправить')
	                    )
	                )
				)
	        )
        }
	},

	formmodal: function()
	{	
		if($('#myModal').length == 0)
		{	
			$("body").append(
				$('<div/>',{id:'myModal',class:'modal hide',role:'dialog'}).append(
            		$('<div/>',{class:'modal-dialog'}).append(
                		$('<div/>',{class:'modal-content'}).append(
                    		$('<div/>',{class:'modal-body'}).append(
                        		$('<b/>').text('Товар добавлен в корзину!')
	                        )
	                    )
	                )
	            )
	        );
	  	}
	},	
	
	isEmptyObject: function(obj) 
	{
		for (var i in obj) {
        	if (obj.hasOwnProperty(i)) {
        		return false;
			}
		}
		return true;
	},
	addbasketfixed: function()
	{
		$('body').append("\<div class = 'cart_fixed'><span class = 'basket'></span>\
		<span id='basketwidjetfixed' class='numsinbasket'></span>\
		</div>\
		");
	},

	showfixedcart: function(node) 
	{
		var widget = this;
		var doc = $(window); 
		
		var docTop = doc.scrollTop(),
		anchorTop = $('.sticky-anchor').offset().top;

	    if(docTop > anchorTop+50){
			if(!widget.options.cartfixed){
				$('.cart_fixed').fadeIn(500);        
				widget.options.cartfixed = true;
			}
		}  
		else   {
			if(widget.options.cartfixed){
				$('.cart_fixed').fadeOut(200);
				widget.options.cartfixed = false;
			}
		}
  			
	}
	
});
}( jQuery ) );
