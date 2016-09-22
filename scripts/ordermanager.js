$.widget('alexb.ordermanager', {

    options: {
        storage: false,
        operator: false,
        testMode: null,
        collector: false,
        dummy: 'dummy',
        consecutiveNumber: false,
        user: null,
    },

    orderId: null,
    order: null,
    formatFloat: formatFloat2FractDigits,

    _create: function () {
        var widget = this;

        $(widget.element).append(
            $('<button/>', {class: 'test-db', style: 'position:absolute; top:10px; right:10px;'}).text(
                widget.options.testMode ? 'Обычный режим' : 'Тестовый режим'
            )
        );

        this.element.on('click', '#set-market-prices-btn', function() { widget._setOrderMarketPrices(widget.orderId) });
        this.element.on('click', '#set-price-3fract-digits-btn', function() { widget._setOrderPrice3FractDigits(widget.orderId) });
        this.element.on('click', '.test-db', function () {
            widget._refresh();
        });

        if (['operator', 'collector'].indexOf(widget.options.user.role) < 0) {
            //console.log(widget.options.user);
            alert('Пользователь не идентифицирован')
            return false;
        }

        this.element.on('click', '.new-order-btn', function () {
            widget._openCreateNewOrderBox();
        });
        this.element.on('click', '.client-special-prices-btn', function () {
            widget._openClientSpecialPricesBox();
        });
        this.element.on('click', '.order-id-sel', function (event) {
            //event.preventDefault();
            widget._findOrderById($(this).data('order-id'));
            $('.order-id-sel').css('font-weight', 'unset');
            $(this).css('font-weight', 'bold');

        });
        this.element.on('keypress', '.order-id-input', function (event) {
            if (event.which == 13) {
                event.preventDefault();
                widget._findOrderById($(this).val());
            }
        });
        this.element.on('keypress', '#client-name-input', function (event) {
            if (event.which == 13) {
                event.preventDefault();
                widget._listOrders({clientName: $(this).val()});
            }
        });
        this.element.on('click', '#filter-orders-by-client-name-btn', function (event) {
            widget._listOrders({clientName: $('#client-name-input').val()});
        });
        this.element.on('click', 'form.add-items button', function (event) {
            event.preventDefault();
            widget._addOrderItems(widget.orderId, $('form.add-items .add-items-input').val());
        });
        this.element.on('keypress', '.add-items-input', function (event) {
            if ((event.which == 13 && event.ctrlKey) || (event.which == 10 && event.ctrlKey)) {
                event.preventDefault();
                widget._addOrderItems(widget.orderId, $(this).val());
            }
        });

        $('body').on('focus', '[contenteditable]', function (event) {
            $(this).selectText();
            $(this).closest('tr').css('background-color', 'lightgray');
        });
        $('body').on('keypress', 'td[contenteditable]', function (event) {
            if (event.which == 13) {
                event.preventDefault();
                var i = $(this).index();
                $(this).blur().closest('tr').next().children().eq(i).focus();
            }
        });
        $('body').on('blur', '.editable-aquantity', function (event) {
            $(this).closest('tr').css('background-color', '');
            widget._setOrderItemAvailableQuantity($(this).closest('tr').data('itemId'), $(this).text());
            widget._recalculateOrder();
        });
        $('body').on('blur', '.editable-pquantity', function (event) {
            $(this).closest('tr').css('background-color', '');
            widget._setOrderItemPurchaseQuantity($(this).closest('tr').data('itemId'), $(this).text());
        });
        $('body').on('blur', '.editable-clientspecialprice', function (event) {
            $(this).closest('tr').css('background-color', '');
            widget._setClientPrice($(this).closest('tr').data('id'), $(this).text());
        });

        this.element.on('click', 'span.quantity', function () {
            var $element = $(this);
            var $container = $element.parent();
            $container.html($('<input/>', {'class': 'editable quantity'}).val($element.text()));
            $container.find('input').focus().select();
        });
        this.element.on('keypress', 'input.quantity', function (event) {
            if (event.which == 13) {
                event.preventDefault();
                $(this).trigger('changequantity');
            }
        });
        this.element.on('blur', 'input.quantity', function (event) {
            $(this).trigger('changequantity');
        });
        this.element.on('changequantity', 'input.quantity', function (event) {
            var $input = $(this);
            var itemId = $input.closest('tr').data('itemId');
            var q = $input.val();

            var $container = $input.parent();
            $container.html($('<span/>', {'class': 'editable quantity'}).text($input.val()));

            widget._setOrderItemQuantity(itemId, q);
            widget._recalculateOrder();
        });

        this.element.on('change', '#collect-at-storage', function () {
            sendRequest({
                action: 'cart2.setordercollectatstorage',
                data: {id: widget.orderId, value: $(this).prop('checked')?1:0},
                successHandler: function (_callbackParams) {
                    var response = _callbackParams.response;
                    if (!response.success) alert(response.message);
                }
            });
        });

        this.element.on('change', 'input.collected', function () {
            var $input = $(this);
            var collected = $input.prop('checked') ? 1 : 0;
            var itemId = $input.closest('tr').data('itemId');
			$input.hide();
			var $loader = $('<img />', {src: '/application/modules/basic/images/loader.gif'});
			$input.after($loader);
            sendRequest({
				ajaxGlobal: false,
                action: 'cart2.setorderitemcollected',
                data: {id: itemId, collected: collected},
                successHandler: function (_callbackParams) {
                    var response = _callbackParams.response;
                    if (!response.success) {
						$input.prop('checked', !collected);
                        alert(response.message);
					}
                },
				completeHandler: function() {
					$input.show();
					$loader.remove();
				}
            });
        });

        this.element.on('click', 'span.comment', function () {
            var $element = $(this);
            var $container = $element.parent();
            $container.html($('<input/>', {'class': 'editable comment'}).val($element.text()));
            $container.find('input').focus().select();
        });
        this.element.on('keypress', 'input.comment', function (event) {
            if (event.which == 13) {
                event.preventDefault();
                $(this).trigger('setorderitemcomment');
            }
        });
        this.element.on('blur', 'input.comment', function (event) {
            $(this).trigger('setorderitemcomment');
        });
        this.element.on('setorderitemcomment', 'input.comment', function (event) {
            var $input = $(this);
            var itemId = $input.closest('tr').data('itemId');
            var val = $input.val();

            var $container = $input.parent();
            $container.html($('<span/>', {'class': 'editable comment'}).text(val));

            widget._setOrderItemComment(itemId, val);
        });

        this.element.on('click', '.btn-clear-order', function () {
            if (confirm('Удалить все позиции?')) {
                widget._clearOrder(widget.orderId);
            }
        });

        this.element.on('click', '.btn-delete-order', function () {
            if (confirm('Удалить заказ?')) {
                widget._deleteOrder(widget.orderId);
            }
        });

        this.element.on('click', '.usd-rate', function () {
            var $element = $(this);
            var $container = $element.parent();
            $container.html($('<input/>', {'class': 'usd-rate'}).val($element.text()));
            $container.find('input').focus().select();
        });
        this.element.on('keypress', 'input.usd-rate', function (event) {
            if (event.which == 13) {
                event.preventDefault();
                $(this).trigger('setorderusdrate');
            }
        });
        this.element.on('blur', 'input.usd-rate', function (event) {
            $(this).trigger('setorderusdrate');
        });
        this.element.on('setorderusdrate', 'input.usd-rate', function (event) {
            var $input = $(this);
            var usdRate = $input.val();

            var $container = $input.parent();
            $container.html($('<span/>', {'class': 'usd-rate'}).text($input.val()));

            widget._setOrderUsdRate(widget.orderId, usdRate);
        });

        this.element.on('click', 'span.price', function () {
            var $element = $(this);
            var $container = $element.parent();
            $container.html($('<input/>', {'class': 'editable price'}).val($element.text()));
            $container.find('input').focus().select();
        });
        this.element.on('keypress', 'input.price', function (event) {
            if (event.which == 13) {
                event.preventDefault();
                $(this).trigger('setorderitemprice');
            }
        });
        this.element.on('blur', 'input.price', function (event) {
            $(this).trigger('setorderitemprice');
        });
        this.element.on('setorderitemprice', 'input.price', function (event) {
            var $input = $(this);
            var itemId = $input.closest('tr').data('itemId');
            var price = $input.val();

            var $container = $input.parent();
            $container.html($('<span/>', {'class': 'editable price'}).html($input.val() ? $input.val() : '&nbsp'));

            widget._setOrderItemPrice(itemId, price);
            //widget._findOrderById(widget.orderId);
            widget._recalculateOrder();
        });

        this.element.on('click', '.btn-appoint-collector', function () {
            widget._appointCurrentCollector(widget.orderId, widget.options.user.id);
        });

        this.element.on('click', '.update-client-btn', function () {
            widget._openUpdateClientDialog();
        });

        this.element.on('click', '.btn-order-collected', function () {
            var $uncollected = $('#order-items input:checkbox.collected[value=0]');
            if ($uncollected.length != 0)
                alert('Некоторые позиции не отмечены. Пожалуйста, проверьте, возможно вы что-то пропустили и не доложили.');
            else {
                sendRequest({
                    action: 'cart2.setordercollected',
                    data: {
                        id: widget.orderId
                    },
                    successHandler: function (_callbackParams) {
                        var response = _callbackParams.response;
                        if (!response.success)
                            alert(response.message);
                        else {
                            widget._findOrderById(widget.orderId);
                            widget._listOrders();
                        }
                    }
                });
            }
        });

        this.element.on('click', '.btn-order-send-to-assembly', function () {
            widget._setOrderStatus(widget.orderId, 'СБОРКА', null);
        });

        this.element.on('click', '.btn-order-status', function () {
            widget._setOrderStatus(widget.orderId, $(this).data('status'), null);//'ДОСТАВКА''НЕДОБОР''ПЕРЕГОВОРЫ'
        });

        this.element.on('click', '.btn-order-status-close', function () {
            var $btnCloseOrder = $(this);
            var $dialog = $('<div/>', {id: 'result-order-box', title: 'Закрытие заказа'});
            var $selectOrderResult;
            $($dialog).append(
                $('<label/>').text('Результат: '),
                $selectOrderResult = $('<select/>', {name: 'result', class: 'order-result'}).each(function () {
                    var $select = $(this);
                    $.each(
                        {
                            'СДЕЛКА': 'СДЕЛКА',
                            'ОТМЕНА': 'ОТМЕНА',
                            'ТАЙМАУТ': 'ТАЙМАУТ',
                        },
                        function (key, value) {
                            $($select).append(
                                $('<option/>', {
                                    value: key,
                                    text: value
                                })
                            )
                        }
                    );
                }).val('')
            );
            $($dialog).dialog({
                width: 470,
                buttons: [
                    {
                        text: "OK",
                        click: function () {
                            widget._setOrderStatus(widget.orderId, $($btnCloseOrder).data('status'), $($selectOrderResult).val());
                            //widget._setOrderResult(widget.orderId, $($selectOrderResult).val());
                            $($dialog).dialog('destroy');
                        }
                    },
                ],
                close: function (event, ui) {
                    $($dialog).dialog('destroy');
                }
            });
        });

        this.element.on('click', '.btn-export-order', function () {
            //widget._exportOrder(widget.orderId, 'СБОРКА');
            //document http://elektrozip.local/async/cart2.getorder
            popupWin = window.open('/async/cart2.exportorder?id=' + widget.orderId, 'location,width=490,height=368,top=0');
            popupWin.focus();
            return false;
        });

        this.element.on('change keyup', '.payment', function () {
            //todo value to data
            sendRequest({
                action: 'cart2.setorderpayment',
                data: {
                    id: widget.orderId,
                    payment: $('.payment').val()
                },
                successHandler: function (_callbackParams) {
                    var response = _callbackParams.response;
                    if (!response.success)
                        alert(response.message);
                    else {
                    }
                }
            });
        });

        this.element.on('change keyup', '.paid', function () {
            //todo value to data
            sendRequest({
                action: 'cart2.setorderpaid',
                data: {
                    id: widget.orderId,
                    paid: $('.paid').prop('checked') ? 1 : 0
                },
                successHandler: function (_callbackParams) {
                    var response = _callbackParams.response;
                    if (!response.success)
                        alert(response.message);
                    else {
                    }
                }
            });
        });

        this.element.on('click', '.edit-alternative', function () {
            var code = prompt("Введите код для альтернативной позиции", "");
            if (code == null) return;
            widget._setOrderItemAlternative($(this).closest('tr').data('itemId'), code);
        });

        this._refresh();
    },


    _refresh: function () {
        var widget = this;
        widget.element.empty();
        var orderId = null;
        if (window.location.hash) orderId = parseInt(window.location.hash.substring(1));

        $(widget.element).append(
            $('<button/>', {class: 'test-db', style: 'position:absolute; top:10px; right:10px;'}).text(
                widget.options.testMode ? 'Обычный режим' : 'Тестовый режим'
            )
        );

        $(widget.element).append(
            $('<p/>').html('Создать <span class="new-order-btn" style="text-decoration: underline; cursor: pointer">новый</span> заказ либо найти по номеру: <input class="order-id-input" type="text" value="" />')
        );

        $(widget.element).append(
            $('<p/>')
                .append($('<span/>').text('Найти заказ(ы) по имени Клиента: '))
                .append($('<input/>', {id: 'client-name-input'}))
                .append($('<button/>', {id: 'filter-orders-by-client-name-btn'}).text('Найти'))
        );
        
        $(widget.element).append(
            $('<label/>').text('Очередь заказов: '),
            $('<div/>', {class: 'orders-list-box', style: 'display:inline;'})
        );
        
        if (orderId) {
            widget.element.find('.order-id-input').val(orderId);
            widget._findOrderById(orderId);
        }

        widget._listOrders();
    },

    _fillSelectClients: function (_$select, _value) {
        var widget = this;
        sendRequest({
            action: 'cart2.getclients',
            data: null,
            successHandler: function (_callbackParams) {
                var response = _callbackParams.response;
                if (!response.success)
                    alert(response.message);
                else {
                    //console.log(response.data.list);
                    var list = response.data.list;
                    $(_$select).each(function () {
                        var $select = $(this);
                        $.each(
                            list,
                            function (key, value) {
                                $($select).append(
                                    $('<option/>', {
                                        value: value['id'],
                                        text: value['name'] + (value['city'] ? ' (' + value['city'] + ')' : '')
                                    }).data('sales_channel', value['sales_channel'])
                                )
                            }
                        );
                    }).val(_value);

                    $('.select-clients').on('change keyup', function () {
                        var salesChannel = $(this).find('option:selected').data('sales_channel');
                        //console.log(salesChannel);
                        $('.sales-channel').val(salesChannel);
                    });

                    $(_$select).click();


                }
            }
        });
    },

    _openCreateNewOrderBox: function () {
        var widget = this;
        var $dialog = $('<div/>', {id: 'create-order-box', title: 'Создать заказ'});
        var $form;
        $($dialog).append(
            $form = $('<form/>', {class: 'form-create-order'})
                .append(
                $('<label/>').text('Клиент: '),
                //$('<input/>', {name: 'client_id'}),$('<br/>'),
                $selectClients = $('<select/>', {name: 'client_id', class: 'select-clients'}), $('<br/>'),
                $('<label/>').text('Канал: '),
                $('<select/>', {name: 'sales_channel', class: 'sales-channel'}).each(function () {
                    var $select = $(this);
                    $.each(
                        {
                            '': '',
                            'Сайт: Телефон': 'Сайт: Телефон',
                            'Сайт: E-Mail': 'Сайт: E-Mail',
                            'Звонок от менеджера': 'Звонок от менеджера',
                            'Рекомендация': 'Рекомендация',
                        },
                        function (key, value) {
                            $($select).append(
                                $('<option/>', {
                                    value: key,
                                    text: value
                                })
                            )
                        }
                    );
                }).val('')
                , $('<br/>')
            )
        );
        widget._fillSelectClients($selectClients);

        $($dialog).dialog({
            width: 470,
            buttons: [
                {
                    text: "Добавить нового клиента",
                    click: function () {
                        widget._openCreateNewClient();
                    }
                },
                {
                    text: "Создать",
                    click: function () {
                        widget._createNewOrder(
                            $('.form-create-order').serializeObject()
                        );
                    }
                }
            ],
            close: function (event, ui) {
                $($dialog).dialog('destroy');
            }
        });
    },

    _openCreateNewClient: function () {
        var widget = this;
        var $dialog = $('<div/>', {id: 'create-client-box', title: 'Добавление клиента'});
        var $form;
        $($dialog).append(
            $form = $('<form/>', {class: 'form-create-client'})
                .append(
                $('<label/>').text('Имя: '),
                $('<input/>', {name: 'name'}), $('<br/>'),
                $('<label/>').text('Канал: '),
                $('<select/>', {name: 'sales_channel', class: 'sales-channel'}).each(function () {
                    var $select = $(this);
                    $.each(
                        {
                            '': '',
                            'Сайт: Телефон': 'Сайт: Телефон',
                            'Сайт: E-Mail': 'Сайт: E-Mail',
                            'Звонок от менеджера': 'Звонок от менеджера',
                            'Рекомендация': 'Рекомендация',
                        },
                        function (key, value) {
                            $($select).append(
                                $('<option/>', {
                                    value: key,
                                    text: value
                                })
                            )
                        }
                    );
                }).val('')
                , $('<br/>'),
                $('<label/>').text('Номер телефона: '),
                $('<input/>', {name: 'phone'}), $('<br/>'),
                $('<label/>').text('Город: '),
                $('<input/>', {name: 'city'}), $('<br/>'),
                $('<label/>').text('Email: '),
                $('<input/>', {name: 'email'}), $('<br/>')
            )
        );

        $($dialog).dialog(
            {
                width: 470,
                buttons: [
                    {
                        text: "Добавить",
                        click: function () {
                            widget._createNewClient(
                                $('.form-create-client').serializeObject()
                            );
                        }
                    }
                ],
                close: function (event, ui) {
                    $($dialog).dialog('destroy');
                }
            }
        );
    },

    _openClientSpecialPricesBox: function () {
        var widget = this;
        
        var $box = $('<div/>', {id: 'client-special-prices-box'});
        $box.modal({minWidth: 800, minHeight: 600});
        $box.append($('<p/>').css('font-weight', 'bold').text('Цены для клиента "'+widget.order.client.name+(widget.order.client.city ? ', '+widget.order.client.city : '')+'"'));
        $box.append($('<div/>', {id: 'client-prices-uploader', style: 'float: left'})).append($('<button/>', {id: 'btn-import-client-prices', rel: ''}).text('Импортировать')).append($('<p/>'));
        $box.append($('<ul/>', {'class': 'messages'}));
        
        var $itemsTable = $('<table/>', {'class': 'items'}).appendTo($box);
        $itemsTable
            .append($('<thead/>')
                .append($('<th/>').text('№'))
                .append($('<th/>').text('Код'))
                .append($('<th/>').text('Наименование'))
                .append($('<th/>').text('Цена [у.е.]'))
            ).append($('<tbody/>'));
        
        
        var clientPricesUploader = new qq.FileUploader({
            element: document.getElementById('client-prices-uploader'),
            action: '/async/basic.fileupload',
            multiple: false,
            debug: true,
            allowedExtensions: ['xls', 'xlsx', 'csv'],
            onSubmit: function (id, fileName) {
            },
            onComplete: function (id, fileName, responseJSON) {
                if (!responseJSON.success) {
                    alert('Error: ' + responseJSON.message);
                } else {
                    $('#btn-import-client-prices').attr('rel', fileName);
                }
            },
            onError: function (id, fileName, xhr) {
                alert('File upload error.');
            }
        });

        
        $('#btn-import-client-prices').on('click', function () {
            var $messages = $('#client-special-prices-box ul.messages').empty();
            var filename = $('#btn-import-client-prices').attr('rel');
            sendRequest({
                action: 'cart2.importclientprices',
                data: {clientId: widget.order.client.id, filename: filename},
                successHandler: function (_callbackParams) {
                    var response = _callbackParams.response;
                    if (!response.success)
                        alert(response.message);
                    else {
                        var messages = response.data.messages;
                        if (messages) {
                            for (var i = 0, len = messages.length; i < len; i++)
                                $messages.append($('<li/>').html(messages[i].message));
                        }
                        widget._refreshClientPrices();
                    }
                }
            });
        });
        
        widget._refreshClientPrices();
    },
    
    _refreshClientPrices: function() {
        var widget = this;
        var $itemsTable = $('#client-special-prices-box table.items tbody').empty();
        sendRequest({
            action: 'cart2.getclientprices',
            data: {clientId: widget.order.client.id},
            successHandler: function (_callbackParams) {
                var response = _callbackParams.response;
                if (!response.success)
                    alert(response.message);
                else {
                    var items = response.data.items;
                    for (var i = 0, len = items.length; i < len; i++) {
                        var item = items[i];
                        $itemsTable.append($('<tr/>', {'data-id': item.id})
                            .append($('<td/>', {style: 'text-align: right'}).text(i+1))
                            .append($('<td/>', {style: 'text-align: center'}).text(item.code))
                            .append($('<td/>').text(item.name))
                            .append($('<td/>', {
                                    style: 'text-align: right',
                                    contenteditable: true,
                                    'class': 'price editable editable-clientspecialprice'
                                }).html(item.price_usd ? formatFloat3FractDigits(item.price_usd) : '&nbsp')
                            )
                        );
                    }
                }
            }
        });
    },

    _createNewClient: function (_data) {
        //console.log(_data);
        var widget = this;
        sendRequest({
            action: 'cart2.createclient',
            data: _data,
            successHandler: function (_callbackParams) {
                var response = _callbackParams.response;
                if (!response.success)
                    alert(response.message);
                else {
                    $('#create-client-box').dialog('close');
                    //console.log(response.data.id);
                    widget._fillSelectClients($('.select-clients'), response.data.id);
                }
            }
        });
    },

    _listOrders: function (_filters) {
        var widget = this;
        
        var role = widget.options.user.role;
        var data = {};
        
        if (role == 'operator')
            data.mode = 'not_closed';
        else if (role == 'collector')
            data.mode = 'to_assembly';
        
        if (_filters !== undefined) {
            data.filters = _filters;
        }

        
        $('.orders-list-box').empty();
        sendRequest({
            action: 'cart2.getorders',
            data: data,
            successHandler: function (_callbackParams) {
                var response = _callbackParams.response;
                var order = response.data.order;
                if (!response.success)
                    alert(response.message);
                else {
                    if (typeof response.data.list == undefined) {
                        alert('response.data.list');
                    }
                    if (response.data.list.length)
                        for (var i in response.data.list) {
                            var order = response.data.list[i];
                            var id = order.id;
                            var bgColor = 'lightgray';
                            if (order.collector_id != null) bgColor = 'red';
                            if (order.collectAtStorage == 1) bgColor = 'yellow';
                            $('.orders-list-box').append(
                                $('<button/>', {class: 'order-id-sel'})
                                    .text(id)
                                    .data('order-id', id)
                                    .css({
                                        'font-weight': (parseInt(widget.orderId) == parseInt(id) ? 'bold' : 'unset'),
                                        'background-color': bgColor
                                    })
                            );
                        }
                    else
                        $('.orders-list-box').append('пусто');
                }
            }
        });
    },

    _createNewOrder: function (_data) {
        var widget = this;
        sendRequest({
            action: 'cart2.createorder',
            data: _data,
            successHandler: function (_callbackParams) {
                var response = _callbackParams.response;
                if (!response.success)
                    alert(response.message);
                else {
                    $('#create-order-box').dialog('close');
                    widget._findOrderById(response.data.id);
                    widget._listOrders();
                }
            }
        });
    },

    _findOrderById: function (_orderId, _errors) {
        var widget = this;

        var $orderDetailsBox = widget.element.find('#order-details-box');
        if ($orderDetailsBox.length == 0) $orderDetailsBox = $('<div/>', {id: 'order-details-box'}).appendTo(widget.element);
        $orderDetailsBox.empty();
        widget.orderId = null;
        widget.order = null;

        sendRequest({
            action: 'cart2.getorder',
            data: {id: _orderId},
            successHandler: function (_callbackParams) {
                var response = _callbackParams.response;
                if (!response.success)
                    alert(response.message);
                else {
                    widget.orderId = _orderId;
                    widget.order = response.data.order;
                    widget.formatFloat = (widget.order.price3FractDigits == 0) ? formatFloat2FractDigits : formatFloat3FractDigits;
                    
                    
                    widget.element.find('.order-id-input').val(widget.orderId);
                    window.location.hash = '#' + _orderId;
                    

                    $('<p/>').append($('<form/>', {'class': 'add-items'})
                            .append($('<textarea/>', {
                                'class': 'add-items-input',
                                rows: 4,
                                cols: 60
                            }).attr('placeholder', 'Добавить позиции...'))
                            .append('<br/>')
                            .append($('<button/>').css('margin-top', '5px').text('Добавить'))
                    ).appendTo($orderDetailsBox);


                    if (_errors != undefined) {
                        var $errorsList = $('<ul/>').appendTo($orderDetailsBox);
                        for (var i = 0, len = _errors.length; i < len; i++)
                            $errorsList.append($('<li/>').css('color', 'red').text(_errors[i]));
                    }


                    var order = response.data.order;
                    var user = widget.options.user;
                    var role = user.role;

                    if (role=='operator' && order.client.dc == 1) {
                        $($orderDetailsBox).append(
                            $('<p/>').css('color', 'red').html('Внимание! Это клиент ДС. У него особые <span class="client-special-prices-btn" style="text-decoration: underline; cursor: pointer">цены</span>!')
                        );
                    }

                    var $orderTitleBlock = $('<p/>').css('font-size', 18)
                        .append($('<b/>')
                            .text('Заказ №'+_orderId
                                +' от '+formatDateDdMmYyyy(order.created)
                                +' ('+order.status+(order.result?', '+order.result:'')+')'))
                        .appendTo($orderDetailsBox);

                    
                    var $clientDataBlock = $('<p/>')
                        .append($('<b/>').text('Клиент: '))
                        .append($('<span/>', {'class': (role=='operator'?'btn update-client-btn':'')}).text(order.client.name))
                        .appendTo($orderDetailsBox);
                    if (order.client.city) $clientDataBlock.append(', ').append($('<span/>').text(order.client.city));
                    if (order.client.phone) $clientDataBlock.append(', ').append($('<span/>').text(order.client.phone));
                    if (order.client.email) $clientDataBlock.append(', ').append($('<span/>').text(order.client.email));
                    
                    
                    $('<p/>').appendTo($orderDetailsBox)
                        .append($('<b/>').text('Оплата: '))
                        .append(
                            $('<select/>', {class: 'payment'}).each(function () {
                                var $select = $(this);
                                $.each(
                                    {
                                        'НП': 'Наложенным платёжом',
                                        'НАЛ': 'Наличными',
                                        'КАРТА': 'Карта'
                                    },
                                    function (key, value) {
                                        $($select).append(
                                            $('<option/>', {
                                                value: key,
                                                text: value
                                            })
                                        )
                                    }
                                );
                            }).val(order.payment).attr('disabled', role == 'collector')
                        )
                        .append(
                            $('<input/>', {
                                type: 'checkbox', class: 'paid', id: 'order-paid'
                            }).prop('checked', (typeof order.paid == 'string') ? order.paid == true : false)
                                .attr('disabled', role == 'collector')
                        ).append(
                            $('<label/>', {for: 'order-paid'}).text('Оплачено ')
                        );
                        
                        
                    var $collectorBlock = $('</p>').appendTo($orderDetailsBox)
                        .append($('<b/>').text('Сборщик: '))
                        .append(
                            $('<span/>', {class: 'collector'})
                                .text((typeof order.collector == 'object') ? order.collector.login : 'не определён ')
                        );
                    if (role == 'operator') {
                        $collectorBlock
                            .append($('<button/>', {class: 'btn-order-send-to-assembly'})
                                .css('margin-left','5')
                                .text('Отправить на сборку'));
                        $collectorBlock
                            .append($('<input/>', {id: 'collect-at-storage', type: 'checkbox'}).prop('checked', order.collectAtStorage==1))
                            .append($('<label/>', {for: 'collect-at-storage'}).text('Сборка со склада'));
                    }

                    var $orderPanelBtn = $('<div/>', {class: 'panel-btn'}).appendTo($orderDetailsBox);
                    if (role == 'collector' && order.status == 'СБОРКА') {
                        if (!order.collector_id) {
                            $($collectorBlock).append(
                                $('<button/>', {class: 'btn-appoint-collector'}).text('Я соберу')
                            );
                        }
                        if (order.collector_id == user.id) {
                            $($orderPanelBtn).append(
                                $('<button/>', {class: 'btn-order-collected'}).text('Собрано')
                            );
                        }
                    } else if (role == 'operator') {
                        $($orderPanelBtn).append(
                            $('<label/>').text(' установить статус: ')
                        ).append(
                            $('<button/>', {class: 'btn-order-status'}).text('ОТПРАВКА').data('status', 'ОТПРАВКА')
                        ).append(
                            $('<button/>', {class: 'btn-order-status'}).text('ДОСТАВКА').data('status', 'ДОСТАВКА')
                        ).append(
                            $('<button/>', {class: 'btn-order-status'}).text('ОТЗЫВ').data('status', 'ОТЗЫВ')
                        ).append(
                            $('<button/>', {class: 'btn-order-status'}).text('НЕДОБОР').data('status', 'НЕДОБОР')
                        ).append(
                            $('<button/>', {class: 'btn-order-status'}).text('ПЕРЕГОВОРЫ').data('status', 'ПЕРЕГОВОРЫ')
                        ).append(
                            $('<button/>', {class: 'btn-order-status-close'}).text('ЗАКРЫТЬ').data('status', 'ЗАКРЫТ')
                        ).append(
                            $('<label/>').text(' ')
                        );
                    }
                    $($orderPanelBtn).append(
                        $('<button/>', {class: 'btn-export-order'}).text('Экспортировать')
                    );


                    $('<p/>')
                        .append($('<label/>').text('Курс доллара: '))
                        .append($('<span/>').append($('<span/>', {'class': 'usd-rate'}).text(order.usdRate)))
                        .append($('<button/>', {id: 'set-market-prices-btn', style: 'margin-left: 16px'}).css('display', widget.options.user.role=='operator' ? '' : 'none').text('Установить рыночные цены'))
                        .append($('<button/>', {id: 'set-price-3fract-digits-btn', style: 'margin-left: 16px'}).css('display', widget.options.user.role=='operator' ? '' : 'none').text('Три знака после запятой'))
                    .appendTo($orderDetailsBox);
                    var $itemsTable = $('<table/>', {id: 'order-items'}).appendTo($orderDetailsBox);
                    $itemsTable.append($('<thead/>')
                            .append($('<th/>').css('display', widget.options.collector ? '' : 'none').text(''))
                            .append(widget.options.consecutiveNumber ? $('<th/>').text('№') : null)
                            .append($('<th/>').text('Заказано'))
                            .append($('<th/>').text('Доступно'))
                            .append($('<th/>').text('Код'))
                            .append($('<th/>').text('Наименование'))
                            .append($('<th/>').css('display', widget.options.storage ? '' : 'none').text('Закупка'))
                            .append($('<th/>').text('Цена [у.е.]'))
                            .append($('<th/>').text('Сумма [у.е.]'))
                            .append($('<th/>').text('Сумма [грн]'))
                            .append($('<th/>').text('Комментарий'))
                    );

                    var totalSum = 0;
                    var totalSumColor = 'black';
                    var totalPurchasedItems = 0;
                    var items = order.items;
                    for (var i = 0, len = items.length; i < len; i++) {
                        var item = items[i];
                        var sum = item.price && item.availableQuantity ? item.availableQuantity * parseFloat(item.price) : 0;
                        totalSum += sum;
                        totalPurchasedItems += parseInt(item.purchasedQuantity ? item.purchasedQuantity : 0);
                        var bgcolor = item.comment ? 'lightblue' : 'transparent';
                        
						var color = 'black';
                        if (item.availableQuantity == 0) color = 'red';
                        else if (item.requiredQuantity != item.availableQuantity) color = 'blue';
                        if (widget.options.user.role == 'operator'  &&  (item.price == null || (item.price == 0 && item.availableQuantity != 0))) color = totalSumColor = 'magenta';
						
                        $itemsTable.append($('<tr/>', {'data-item-id': item.id}).css({color: color, 'background-color': bgcolor}).data('itemId', item.id)
                                .append($('<td/>', {style: 'text-align: center'}).css('display', widget.options.collector ? '' : 'none').append($('<input/>', {
                                    type: 'checkbox',
                                    'class': 'boolean collected'
                                }).prop('checked', item.collected == 1).val(item.collected)))
                                .append(widget.options.consecutiveNumber ? $('<td/>', {style: 'text-align: right'}).text(i + 1) : null)
                                .append($('<td/>', {style: 'text-align: right'}).append($('<span/>', {'class': 'editable quantity'}).text(item.requiredQuantity)))
                                .append($('<td/>', {
                                    style: 'text-align: right',
                                    'class': 'editable editable-aquantity',
                                    contenteditable: true
                                }).text(item.availableQuantity ? item.availableQuantity : ''))
                                .append($('<td/>', {
                                    style: 'text-align: center',
                                    'class': 'edit-alternative',
                                    title: "Кликни, чтобы предложить альтернативу"
                                }).css('cursor', 'pointer').text(item.code))
                                .append($('<td/>').text(item.name))
                                .append($('<td/>', {
                                    style: 'text-align: right',
                                    'class': 'editable editable-pquantity',
                                    contenteditable: true
                                }).css('display', widget.options.storage ? '' : 'none').text(item.purchasedQuantity ? item.purchasedQuantity : ''))
                                .append($('<td/>', {style: 'text-align: right'}).append($('<span/>', {'class': 'editable price'}).html(item.price ? widget.formatFloat(item.price) : '&nbsp')))
                                .append($('<td/>', {class: 'sum-usd', style: 'text-align: right'}).text(widget.formatFloat(sum)))
                                .append($('<td/>', {class: 'sum-uah', style: 'text-align: right'}).text(widget.formatFloat(item.availableQuantity * item.price * order.usdRate)))
                                .append($('<td/>', {style: 'text-align: left'}).append($('<span/>', {'class': 'editable comment'}).html(item.comment ? item.comment : '&nbsp;')))
                        );
                    }

                    $itemsTable.append($('<tfoot/>')
                            .append($('<th/>'))
                            .append(widget.options.consecutiveNumber ? $('<th/>') : null)
                            .append($('<th/>', {style: 'text-align: right'}).text('ИТОГО:'))
                            .append($('<th/>'))
                            .append($('<th/>'))
                            .append($('<th/>'))
                            .append($('<th/>').css({
                                'text-align': 'right',
                                display: (widget.options.storage ? '' : 'none')
                            }).text(totalPurchasedItems))
                            .append($('<th/>'))
                            .append($('<th/>', {class: 'total-sum-usd', style: 'text-align: right; color: ' + totalSumColor + ''}).text(widget.formatFloat(totalSum)))
                            .append($('<th/>', {class: 'total-sum-uah', style: 'text-align: right; color: ' + totalSumColor + ''}).text(widget.formatFloat(totalSum * order.usdRate)))
                    );


                    if (widget.options.user.role == 'operator') {
                        $('<p/>')
                            .append('[<span class="btn btn-clear-order">очистить заказ</span>]')
                            // .append(' ')
                            // .append('[<span class="btn btn-delete-order">удалить заказ</span>]')
                            .appendTo($orderDetailsBox);
                    }
                }
            },
            completeHandler: function (_callbackParams) {
            }
        });
    },

    _recalculateOrder: function () {
        var widget = this;
        var totalSum = 0;
        var usdRate = $('.usd-rate').text();
        $('#order-details-box table').find('tr').each(function () {
            var requiredQuantity = $(this).find('.quantity').text();
            var availableQuantity = $(this).find('.editable-aquantity').text();
            var price = $(this).find('.price').text();
            var sum = price && availableQuantity ? parseFloat(availableQuantity) * parseFloat(price) : 0;
            totalSum += sum;
            $(this).find('.sum-usd').text(widget.formatFloat(sum));
            $(this).find('.sum-uah').text(widget.formatFloat(sum * usdRate));
        });
        var totalSumUAH = totalSum * usdRate;
        $('#order-details-box table').find('.total-sum-usd').text(widget.formatFloat(totalSum));
        $('#order-details-box table').find('.total-sum-uah').text(widget.formatFloat(totalSumUAH));
        this._colorizeOrderItems();
    },

    _colorizeOrderItems: function () {
		var widget = this;
        var totalSumColor = 'black';
        $('#order-details-box table').find('tr').each(function () {
            var requiredQuantity = $(this).find('.quantity').text();
            var availableQuantity = $(this).find('.editable-aquantity').text();
            var price = $(this).find('.price').text();
            //if (quantity !== aquantity)
            var color = 'black';
            if (availableQuantity == 0) color = 'red';
            else if (requiredQuantity != availableQuantity) color = 'blue';
            if (widget.options.user.role == 'operator'  &&  (price == null || (price == 0 && availableQuantity != 0))) color = totalSumColor = 'magenta';
            $(this).css('color', color);
        });
        $('#order-details-box table tfoot th').css('color', totalSumColor);
    },

    _addOrderItems: function (_orderId, _items) {
        var widget = this;
        sendRequest({
            action: 'cart2.addorderitems',
            data: {orderId: _orderId, items: _items},
            successHandler: function (_callbackParams) {
                var response = _callbackParams.response;
                if (!response.success)
                    alert(response.message);
                else {
                    widget._findOrderById(widget.orderId, response.data.errors);
                }
            }
        });
    },

    _setOrderItemQuantity: function (_itemId, _quantity) {
        var widget = this;
        sendRequest({
            action: 'cart2.setorderitemquantity',
            data: {id: _itemId, quantity: _quantity},
            successHandler: function (_callbackParams) {
                var response = _callbackParams.response;
                if (!response.success)
                    alert(response.message);
                else {
                }
            }
        });
    },

    _setOrderItemAvailableQuantity: function (_itemId, _q) {
		console.log(_itemId, _q);
        var widget = this;
		var $tr = $('#order-details-box tr[data-item-id=' + _itemId + ']');
		var $td = $tr.find('.editable-aquantity');
		$td.css({'background': 'url("/application/modules/basic/images/loader.gif") no-repeat'});
        sendRequest({
			ajaxGlobal: false,
            action: 'cart2.setorderitemavailablequantity',
            data: {id: _itemId, q: _q},
            successHandler: function (_callbackParams) {
                var response = _callbackParams.response;
                if (!response.success)
                    alert(response.message);
                else {
                }
            },
			completeHandler: function (_callbackParams) {
				$td.css({'background': 'none'});
			}
        });
    },

    _setOrderItemPurchaseQuantity: function (_itemId, _q) {
        var widget = this;
        if (_q) {
            sendRequest({
                action: 'cart2.setorderitempurchasequantity',
                data: {id: _itemId, q: _q},
                successHandler: function (_callbackParams) {
                    var response = _callbackParams.response;
                    if (!response.success)
                        alert(response.message);
                    else {
                        //widget._findOrderById(widget.orderId);
                    }
                }
            });
        }
    },

    _setClientPrice: function (_id, _price) {
        var widget = this;
        if (_price) {
            sendRequest({
                action: 'cart2.setclientprice',
                data: {id: _id, price: _price},
                successHandler: function (_callbackParams) {
                    var response = _callbackParams.response;
                    if (!response.success)
                        alert(response.message);
                    else {
                        $('#client-special-prices-box table.items tr[data-id='+_id+'] td.price').text(formatFloat3FractDigits(_price));
                    }
                }
            });
        }
    },

    _setOrderItemComment: function (_itemId, _comment) {
        var widget = this;
        sendRequest({
            action: 'cart2.setorderitemcomment',
            data: {id: _itemId, comment: _comment},
            successHandler: function (_callbackParams) {
                var response = _callbackParams.response;
                if (!response.success)
                    alert(response.message);
                else {
                    //widget._findOrderById(widget.orderId);
                }
            }
        });
    },

    _deleteOrderItem: function (_itemId) {
        var widget = this;
        sendRequest({
            action: 'cart2.deleteorderitem',
            data: {id: _itemId},
            successHandler: function (_callbackParams) {
                var response = _callbackParams.response;
                if (!response.success)
                    alert(response.message);
                else {
                    widget._findOrderById(widget.orderId);
                }
            }
        });
    },

    _setOrderUsdRate: function (_orderId, _usdRate) {
        var widget = this;
        sendRequest({
            action: 'cart2.setorderusdrate',
            data: {id: _orderId, usdRate: _usdRate},
            successHandler: function (_callbackParams) {
                var response = _callbackParams.response;
                if (!response.success)
                    alert(response.message);
                else {
                    widget._findOrderById(widget.orderId);
                }
            }
        });
    },

    _setOrderItemPrice: function (_itemId, _price) {
        var widget = this;
        var upp = 0;
        if (confirm(widget.order.client && widget.order.client.dc == 1 ? 'Изменить эту цену так же и в таблице цен клиента?' : 'Изменить эту цену так же и в каталоге на сайте?')) upp = 1;
        sendRequest({
            action: 'cart2.setorderitemprice',
            data: {id: _itemId, price: _price, upp: upp},
            successHandler: function (_callbackParams) {
                var response = _callbackParams.response;
                if (!response.success)
                    alert(response.message);
                else {
                    //widget._findOrderById(widget.orderId);
                }
            }
        });
    },

    _clearOrder: function (_orderId) {
        var widget = this;
        sendRequest({
            action: 'cart2.clearorder',
            data: {id: _orderId},
            successHandler: function (_callbackParams) {
                var response = _callbackParams.response;
                if (!response.success)
                    alert(response.message);
                else {
                    widget._findOrderById(_orderId);
                }
            }
        });
    },

    _deleteOrder: function (_orderId) {
        var widget = this;
        sendRequest({
            action: 'cart2.deleteorder',
            data: {id: _orderId},
            successHandler: function (_callbackParams) {
                var response = _callbackParams.response;
                if (!response.success)
                    alert(response.message);
                else {
                    widget._findOrderById(_orderId);
                }
            }
        });
    },

    _appointCurrentCollector: function (_orderId, _collectorId) {
        var widget = this;
        sendRequest({
            action: 'cart2.appointcollector',
            data: {
                order_id: _orderId,
                collector_id: _collectorId
            },
            successHandler: function (_callbackParams) {
                var response = _callbackParams.response;
                if (!response.success)
                    alert(response.message);
                else {
                    //$('.btn-appoint-collector').hide();
                    widget._findOrderById(widget.orderId);
                }
            }
        });
    },

    _setOrderStatus: function (_orderId, _status, _result) {
        var widget = this;
        sendRequest({
            action: 'cart2.setorderstatus',
            data: {
                id: _orderId,
                status: _status,
                result: _result
            },
            successHandler: function (_callbackParams) {
                var response = _callbackParams.response;
                if (!response.success)
                    alert(response.message);
                else {
                    widget._findOrderById(widget.orderId);
                    widget._listOrders();
                }
            }
        });
    },

    _setOrderItemAlternative: function (_itemId, _code) {
        var widget = this;
        sendRequest({
            action: 'cart2.setalternativeorderitem',
            data: {
                id: _itemId,
                code: _code
            },
            successHandler: function (_callbackParams) {
                var response = _callbackParams.response;
                if (!response.success)
                    alert(response.message);
                else {
                    widget._findOrderById(widget.orderId);
                }
            }
        });
    },
    
    _setOrderMarketPrices: function(_orderId) {
        var widget = this;
        sendRequest({
            action: 'cart2.setordermarketprices',
            data: {id: _orderId},
            successHandler: function(_callbackParams) {
                var response = _callbackParams.response;
                if (!response.success)
                    alert(response.message);
                else {
                    widget._findOrderById(_orderId);
                }
            }
        });
    },
    
    _setOrderPrice3FractDigits: function(_orderId) {
        var widget = this;
        sendRequest({
            action: 'cart2.toggleorderprice3fractdigits',
            data: {id: _orderId},
            successHandler: function(_callbackParams) {
                var response = _callbackParams.response;
                if (!response.success)
                    alert(response.message);
                else {
                    widget._findOrderById(_orderId);
                }
            }
        });
    },
    
    _openUpdateClientDialog: function() {
        var widget = this;
        var client = widget.order.client;
        var $dialog = $('<div/>', {id: 'update-client-box', title: 'Редактировать клиента'});
        $dialog.append($('<form/>', {id: 'update-client-form'})
            .append($('<label/>').text('Имя: ')).append($('<input/>', {type: 'text', name: 'name'}).val(client.name)).append('<br/>')
            .append($('<label/>').text('Город: ')).append($('<input/>', {type: 'text', name: 'city'}).val(client.city)).append('<br/>')
            .append($('<label/>').text('Телефон: ')).append($('<input/>', {type: 'text', name: 'phone'}).val(client.phone)).append('<br/>')
            .append($('<label/>').text('E-mail: ')).append($('<input/>', {type: 'text', name: 'email'}).val(client.email)).append('<br/>')
        );
        $dialog.dialog({
            width: 'auto',
            buttons: [{
                text: 'Сохранить',
                click: function () {
                    widget._updateClient(
                        widget.order.client.id,
                        $('#update-client-form').serializeObject()
                    );
                }
            }],
            close: function (event, ui) {
                $($dialog).dialog('destroy');
            }
        });
    },
    
    _updateClient: function(_id, _data) {
        var widget = this;
        sendRequest({
            action: 'cart2.updateclient',
            data: {id: _id, data: _data},
            successHandler: function (_callbackParams) {
                var response = _callbackParams.response;
                if (!response.success)
                    alert(response.message);
                else {
                    $('#update-client-box').dialog('close');
                    widget._findOrderById(widget.orderId);
                }
            }
        });
    }

});
