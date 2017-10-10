$.widget('xb.abstractManager', {

    options: {
        dummy: 'dummy',
        debug: false,
        tableName: '',
        hasParent: false,
        editAccess: true,
        accessOnlyHead: false,
        globalWidget: false,
        list:{
            addButton: true,
            addPosition:'end',
            addIndexNumber:false,
            moreButton: true,
            deletable: true,
            moveUp: false,
            moveDown: false,
            insertAfter: false,
            insertBefore: false,
            fields: [],
            footer: [],
            firstColumnId:true,//false - first column 'ID' is not dispay
        },
        childManager: null,
        header: false,
        button: 'GO',
        view:{
            editable: false,
            recordId: null,
            /* @author Denis Kucher <dkucher88@gmail.com>
            * @copyright Copyright &copy; 2017
            * @updated 2017.06.22 added to options view.hideMainTable - hide or show main table after click button 'open'
            */
            hideMainTable:false,
            /* @author Denis Kucher <dkucher88@gmail.com>
            * @copyright Copyright &copy; 2017
            * @updated 2017.06.22 added to options view.mode[table/form] mode of view record item
            */
            mode:'form', //[table/form]
            fields:[
                {key: 'name', name: 'Name', inputType: 'text'}
            ],
            options: false,
            relations:[],

        },
        globalSearch: true,
        query:true,
        filters: [],
        filtersReset: false,
        createInputs: [],
        create: {
            fields: [{key: 'name', name: 'Name', inputType: 'text'}],
            modal: true
        }
    },


    /**
     * _create method
     *
     * Attention!
     * If you create new event handler in _create method you must turn-off it in _destroy method!
     */
    _create: function () {
        var widget = this;
        $('<link/>', {
            rel: 'stylesheet', type: 'text/css', href: '/application/modules/basic/styles/abstractmanager.css'
        }).appendTo('head');

        /**
        * Search form button event
        */
        
        $('body').off('submit', '#search'+widget.options.tableName);
        $('body').on('submit', '#search'+widget.options.tableName, function(_e) {
            _e.preventDefault();
            widget._refreshRecords($(this).serializeObject());
        });

        $('body').off('click', '#search'+widget.options.tableName+' .reset-btn');
        $('body').on('click', '#search'+widget.options.tableName+' .reset-btn', function (_e) {
            _e.preventDefault();

            widget.element.find('form#search'+widget.options.tableName)[0].reset();
            widget._refresh();
        });

        /**
         * Child Manager events
         */

        //! [2017.05.30] [Alexander Babayev]: �� �������, ��� ��� ����������...
        widget.element.off('click', '.back-btn');
        widget.element.on('click', '.back-btn', function(_e){
            var content = $('body').find($('#content'));
            content.children().show();
            widget.element.empty();
            $('#selectedRecord').hide();
        });

        /**
         * Global Modal Widgets events
         */

        widget.element.off('click', '.closeModalWidget');
        widget.element.on('click', '.closeModalWidget', function(_e){
            var $modal = $(this).closest('.modal');
            $modal.modal('hide');
            widget.element.empty();
            widget.destroy();
            $modal.empty();
            $modal.remove();
        });

        /**
         * Table Data [contenteditable=true] events
         */
        
        widget.element.off('focus', '#'+widget.options.tableName+'>tbody>tr>td[contenteditable]');
        widget.element.on('focus', '#'+widget.options.tableName+'>tbody>tr>td[contenteditable]', function (_e) {
            $(this).selectText();
            $(this).data('value', $(this).text());
            $(this).closest('tr').css('background-color', 'lightgreen');
        });
        
        widget.element.off('keypress', '#'+widget.options.tableName+'>tbody>tr>td[contenteditable]');
        widget.element.on('keypress', '#'+widget.options.tableName+'>tbody>tr>td[contenteditable]', function (_e) {
            var code = _e.keyCode || _e.which;
            if (code == 13) {
                _e.preventDefault();
                $(this).blur();
            }
        });

        widget.element.off('keydown', '#'+widget.options.tableName+'>tbody>tr>td[contenteditable]');
        widget.element.on('keydown', '#'+widget.options.tableName+'>tbody>tr>td[contenteditable]', function (_e) {
            var code = _e.keyCode || _e.which;
            if (code == 13) {
                _e.preventDefault();
                $(this).trigger('enter');
            } else if (code== 27) {
                $(this).text($(this).data('value')).blur();
            }
        });
        
        widget.element.off('blur', '#'+widget.options.tableName+'>tbody>tr>td[contenteditable]');
        widget.element.on('blur', '#'+widget.options.tableName+'>tbody>tr>td[contenteditable]', function (_e) {
            if ($(this).data('value') != $(this).text()) $(this).trigger('enter');
            $(this).closest('tr').css('background-color', '');
        });
        
        widget.element.off('enter', '#'+widget.options.tableName+'>tbody>tr>td[contenteditable]');
        widget.element.on('enter', '#'+widget.options.tableName+'>tbody>tr>td[contenteditable]', function(_e) {
            var fieldName = $(this).data('key');
            var fields = widget.options.list.fields;
            var success = null;
            for (var i = 0; i < fields.length; i++) {
                var field = fields[i];
                if (field.key == fieldName && field.renderAfterEdit) {
                    success = function(_data) {widget._renderEditableRecord(_data)};
                };
            };
            widget._setValue(widget.options.moduleName.toString().toLowerCase()+'.set'+widget.options.entityName.toString().toLowerCase()+fieldName.toString().toLowerCase(), $(this).closest('tr').data('id'), fieldName, $(this).text(), success);
        });

        /**
         * Table Data Select events
         */
        $('body').off('change', '#'+widget.options.tableName+'>tbody>tr>td>select');
        $('body').on('change', '#'+widget.options.tableName+'>tbody>tr>td>select', function(_e){
            var fieldName = $(this).closest('td').data('key');
            var action = widget.options.moduleName.toString().toLowerCase()+'.set'+widget.options.entityName.toString().toLowerCase()+fieldName.toString().toLowerCase();
            var id = $(this).closest('tr').data('id');
            var value = $(this).val();
            widget._setValue(action, id, fieldName, value, null);
        });

        /**
         * Table Data Select events with #selectedRecord
         */
        $('body').off('change', '#selectedRecord tbody>tr>td>select');
        $('body').on('change', '#selectedRecord tbody>tr>td>select', function(_e){
            var fieldName = $(this).closest('td').data('key');
            var action = widget.options.moduleName.toString().toLowerCase()+'.set'+widget.options.entityName.toString().toLowerCase()+fieldName.toString().toLowerCase();
            var id = $(this).closest('#selectedRecord').data('id');
            var value = $(this).val();
            widget._setValue(action, id, fieldName, value, null);
        });

        /**
         * Table Data Checkbox events
         */
        $('body').off('change', '#'+widget.options.tableName+'>tbody>tr>td>input[type=checkbox]');
        $('body').on('change', '#'+widget.options.tableName+'>tbody>tr>td>input[type=checkbox]', function(_e){
            var fieldName = $(this).closest('td').data('key');
            var action = widget.options.moduleName.toString().toLowerCase()+'.set'+widget.options.entityName.toString().toLowerCase()+fieldName.toString().toLowerCase();
            var id = $(this).closest('tr').data('id');
            var value = '0';
            if($(this).prop('checked')) value = '1';
            widget._setValue(action, id, fieldName, value, null);
        });

        /**
         * Table Data Checkbox events in #selectedRecord
         */
        $('body').off('change', '#selectedRecord tbody>tr>td>input[type=checkbox]');
        $('body').on('change', '#selectedRecord tbody>tr>td>input[type=checkbox]', function(_e){
            var fieldName = $(this).closest('td').data('key');
            var action = widget.options.moduleName.toString().toLowerCase()+'.set'+widget.options.entityName.toString().toLowerCase()+fieldName.toString().toLowerCase();
            var id = $(this).closest('#selectedRecord').data('id');
            var value = '0';
            if($(this).prop('checked')) value = '1';
            widget._setValue(action, id, fieldName, value, null);
        });

        /**
         * Table buttons events
         */
        $('body').off('click', '#'+widget.options.tableName+'>tbody>tr>td>.btn-delete');
        $('body').on('click', '#'+widget.options.tableName+'>tbody>tr>td>.btn-delete', function() {
            widget._deleteRecord($(this).closest('tr').data('id'));
        });

        $('body').off('click', '#'+widget.options.tableName+'>tbody>tr>td>.btn-child');
        $('body').on('click', '#'+widget.options.tableName+'>tbody>tr>td>.btn-child', function() {
            widget._showChildManager($(this).closest('tr').data('id'));
        });

        $('body').off('click', '#'+widget.options.tableName+'>tbody>tr>td>.btn-open');
        $('body').on('click', '#'+widget.options.tableName+'>tbody>tr>td>.btn-open', function() {
            if(widget.options.view.renderPlace === 'body')widget._showRecordBlock($(this).closest('tr').data('id'));
        });

        $('body').off('click', '#'+widget.options.tableName+'>tbody>tr>td>.btn-hide');
        $('body').on('click', '#'+widget.options.tableName+'>tbody>tr>td>.btn-hide', function() {
            if(widget.options.view.renderPlace === 'table'){
                $(this).closest('td').next().children('div').slideToggle('400', 'swing', function(){$(this).closest('td').hide()});
                $(this).text('→').removeClass('btn-hide').addClass('btn-show');
            }
        });

        $('body').off('click', '#'+widget.options.tableName+'>tbody>tr>td>.btn-show');
        $('body').on('click', '#'+widget.options.tableName+'>tbody>tr>td>.btn-show', function() {
            if(widget.options.view.renderPlace === 'table'){
                $(this).closest('td').next().show().children('div').slideToggle('400', 'swing');
                $(this).text('←').removeClass('btn-show').addClass('btn-hide');
            }
        });
        
        $('body').off('click', '#'+widget.options.tableName+'>tfoot>tr>td>.btn-add');
        $('body').on('click', '#'+widget.options.tableName+'>tfoot>tr>td>.btn-add', function() {
            if (widget.options.createInputs.length)
                widget._openInsertRecordModal($(this).closest('tr').data('id'), widget.options.list.addPosition);
            else {
                if (widget.options.create.modal)
                    widget._openCreateRecordModal();
                else
                    widget._renderCreateRecordBlock();
            }
        });

        $('body').off('click', '#'+widget.options.tableName+'>tbody>tr>td>.btn-moveUp');
        $('body').on('click', '#'+widget.options.tableName+'>tbody>tr>td>.btn-moveUp', function() {
            widget._recordMoveUp($(this).closest('tr').data('id'));
        });

        $('body').off('click', '#'+widget.options.tableName+'>tbody>tr>td>.btn-moveDown');
        $('body').on('click', '#'+widget.options.tableName+'>tbody>tr>td>.btn-moveDown', function() {
            widget._recordMoveDown($(this).closest('tr').data('id'));
        });

        $('body').off('click', '#'+widget.options.tableName+'>tbody>tr>td>.btn-insertBefore');
        $('body').on('click', '#'+widget.options.tableName+'>tbody>tr>td>.btn-insertBefore', function() {
            widget._openInsertRecordModal($(this).closest('tr').data('id'), 'before');
        });

        $('body').off('click', '#'+widget.options.tableName+'>tbody>tr>td>.btn-insertAfter');
        $('body').on('click', '#'+widget.options.tableName+'>tbody>tr>td>.btn-insertAfter', function() {
            widget._openInsertRecordModal($(this).closest('tr').data('id'), 'after');
        });

        $('body').off('click', '#create-window .btn-create');
        $('body').on('click', '#create-window .btn-create', function() {
            var data = $('body').find('#create-window form').serializeObject(); 
            widget._renderCreateModalFormAk(data);
        });

        $('body').off('click', '#create-block .btn-create');
        $('body').on('click', '#create-block .btn-create', function() {
            var data = $('body').find('#create-block form').serializeObject(); 
            widget._createRecordIp(data);
        });

        $('body').off('click', '#create-block .btn-cancel');
        $('body').on('click', '#create-block .btn-cancel', function() {
            $(this).parents('#create-block').find('select[name=userId]').val(0);
            $(this).parents('#create-block').hide();
        });

        /**
         * Selected Record Form events
         */

        widget.element.off('blur', '#selectedRecord>form .form-group input');
        widget.element.on('blur', '#selectedRecord>form .form-group input', function (_e) {
            if ($(this).attr('value') != $(this).val()) $(this).trigger('enter');
        });

        widget.element.off('enter', '#selectedRecord>form .form-group input');
        widget.element.on('enter', '#selectedRecord>form .form-group input', function(_e) {
            var updateKey = $(this).attr('name');
            widget._setSelectedRecordValue(updateKey);
        });
        
        /**
         * Table Data [contenteditable=true] events of table#selectedRecord
         * created by Denis Kucher <dkucher88@gmmail.com>
         * 2017.07.03
         */
        
        $('body').off('focus', '#selectedRecord tbody>tr>td[contenteditable]');
        $('body').on('focus', '#selectedRecord tbody>tr>td[contenteditable]', function (_e) {
            $(this).selectText();
            $(this).data('value', $(this).text());
            $(this).closest('tr').css('background-color', 'lightgreen');
        });
        
        $('body').off('keypress', '#selectedRecord tbody>tr>td[contenteditable]');
        $('body').on('keypress', '#selectedRecord tbody>tr>td[contenteditable]', function (_e) {
            var code = _e.keyCode || _e.which;
            if (code == 13) {
                _e.preventDefault();
                $(this).blur();
            }
        });

        $('body').off('keydown', '#selectedRecord tbody>tr>td[contenteditable]');
        $('body').on('keydown', '#selectedRecord tbody>tr>td[contenteditable]', function (_e) {
            var code = _e.keyCode || _e.which;
            if (code == 13) {
                _e.preventDefault();
                $(this).trigger('enter');
            } else if (code== 27) {
                $(this).text($(this).data('value')).blur();
            }
        });
        
        $('body').off('blur', '#selectedRecord tbody>tr>td[contenteditable]');
        $('body').on('blur', '#selectedRecord tbody>tr>td[contenteditable]', function (_e) {
            $(this).closest('tr').css('background-color', '').blur();
            if ($(this).data('value') != $(this).text()) $(this).trigger('enter');
        });
        
        $('body').off('enter', '#selectedRecord tbody>tr>td[contenteditable]');
        $('body').on('enter', '#selectedRecord tbody>tr>td[contenteditable]', function(_e) {
            var fieldName = $(this).data('key');
            var success = null;
            if ($(this).attr('renderafteredit')) {
                success = function() {widget._refreshRecords()};
            };
            
            if ($(this).attr('number')) {
                var value = $(this).text();
                value = value.replace(/,/g, '.');
                var beforeDot = value.substring(0,value.indexOf('.')+1);
                var afterDot = value.substring(value.indexOf('.')+1);
                var afterDot = afterDot.replace(/\./g, '');
                value = beforeDot+afterDot;
                var toFixed = $(this).attr('number');
                value = Number(value).toFixed(Number(toFixed));
            }; 
            $(this).text(value).blur();
            $(this).closest('tr').css('background-color', '');
            widget._setValue(widget.options.moduleName.toString().toLowerCase()+'.set'+widget.options.entityName.toString().toLowerCase()+fieldName.toString().toLowerCase(), $(this).closest('#selectedRecord').data('id'), fieldName, value, success);
        });
        
        $('body').off('focus', '#selectedRecordOptions form>table>tbody>tr>td.optionstr');
        $('body').on('focus', '#selectedRecordOptions form>table>tbody>tr>td.optionstr', function (_e) {
            $(this).selectText();
            $(this).data('value', $(this).text());
            $(this).closest('tr').css('background-color', 'lightgreen');
        });

        widget.element.off('keypress', '#selectedRecordOptions form>table>tbody>tr>td.optionstr');
        widget.element.on('keypress', '#selectedRecordOptions form>table>tbody>tr>td.optionstr', function (_e){
            var code = _e.keyCode || _e.which;
            if (code == 13) {
                _e.preventDefault();
                $(this).blur();
            }
        });

        widget.element.off('keyup', '#selectedRecordOptions form>table>tbody>tr>td.optionstr');
        widget.element.on('keyup', '#selectedRecordOptions form>table>tbody>tr>td.optionstr', function (_e) {
            var code = _e.keyCode || _e.which;
            if (code == 13) {
                _e.preventDefault();
                $(this).trigger('enter');
            } else if (code == 27) {
                $(this).text($(this).data('value')).blur();
            }
        });

        widget.element.off('blur', '#selectedRecordOptions form>table>tbody>tr>td.optionstr');
        widget.element.on('blur', '#selectedRecordOptions form>table>tbody>tr>td.optionstr', function (_e) {
            if ($(this).data('value') != $(this).text()) $(this).trigger('enter');
            $(this).closest('tr').css('background-color', '');
        });

        widget.element.off('enter', '#selectedRecordOptions form>table>tbody>tr>td.optionstr');
        widget.element.on('enter', '#selectedRecordOptions form>table>tbody>tr>td.optionstr', function(_e) {
            var valueId = $(this).closest('tr').attr('value-id');
            var newValue = $(this).text();
            widget._setSelectedRecordOption(valueId, newValue)
        });

        widget.element.off('change', '#selectedRecordOptions form>table>tbody>tr>td.optionselect>select');
        widget.element.on('change', '#selectedRecordOptions form>table>tbody>tr>td.optionselect>select', function(_e) {
            var valueId = $(this).closest('tr').attr('value-id');
            var newValue = $(this).find('option:selected').val();
            widget._setSelectedRecordOption(valueId, newValue)
        });

        /**
         * Modal MultiLanguage events
         */

        widget.element.off('click', 'td[modallang]');
        widget.element.on('click', 'td[modallang]', function(_e) {
            if($(this).attr('modallang')=='true')
            {
                var fieldName = $(this).data('key');
                var rowId = $(this).closest('tr').data('id');
                widget._openMultiLangModal(rowId, fieldName);
            }
        });

        /**
         * Create record form events
         */

        widget.element.off('click', '#modal-insert-'+widget.options.entityName+' .btn-primary');
        widget.element.on('click', '#modal-insert-'+widget.options.entityName+' .btn-primary', function(_e) {
            var $modal = $('#modal-insert-'+widget.options.entityName);
            var data = $modal.find('form').serializeObject();
            widget._insertRecord($modal, data, $modal.data('position'), $modal.data('baseId'));
        });

        widget.element.off('keyup', '#modal-insert-'+widget.options.entityName+' .form-control');
        widget.element.on('keyup', '#modal-insert-'+widget.options.entityName+' .form-control', function (_e) {
            var code = _e.keyCode || _e.which;
            if (code == 13) {
                _e.preventDefault();
                var $modal = $('#modal-insert-'+widget.options.entityName);
                var data = $modal.find('form').serializeObject();
                widget._insertRecord($modal, data, $modal.data('position'), $modal.data('baseId'));
            } else if (code == 27) {
                widget.element.find('#modal-insert-'+widget.options.entityName).modal('hide');
            }
        });
        /* @author Denis Kucher <dkucher88@gmail.com>
        * @copyright Copyright &copy; 2017
        * @updated 2017.06.22 added to options list burron "moreButton" 
        * INFO:
        * onclick call function _loadMoreRecords()
        */
        $('body').off('click', '#'+widget.options.tableName+'>tfoot>tr>td>.btn-more');
        $('body').on('click', '#'+widget.options.tableName+'>tfoot>tr>td>.btn-more', function() {
            var baseId = $(this).closest('table').find('tbody tr:last').data('id');
            var form = $('#search'+widget.options.tableName);
            widget._loadMoreRecords(form.serializeObject(), baseId);
        });
        /* @author Denis Kucher <dkucher88@gmail.com>
        * @copyright Copyright &copy; 2017
        * @updated 2017.06.22 added button 'Back' onclick back to main widget table
        */
        // $('body').off('click', '#selectedRecord .btn-back-to-main');
        // $('body').on('click', '#selectedRecord .btn-back-to-main', function() {
        //     $('#selectedRecord').hide();
        //     if(widget.options.view.relations.length){
        //         alert('1');
        //         for(var i in widget.options.view.relations){
        //             var relation = widget.options.view.relations[i];
        //             var divId = relation.divId;
        //             $('#'+divId+'Block').remove();
        //         }
        //     };
        //     $('#main-table-orders').show();
        // });

        widget._debug('widget '+widget.eventNamespace.substring(0, widget.eventNamespace.length - 1).slice(1)+' has been created');

        this._refresh();
    },


    _destroy: function() {
        var widget = this;
        widget.element.off('submit', '#search'+widget.options.tableName);
        widget.element.off('click', '.back-btn');
        widget.element.off('click', '.closeModalWidget');
        widget.element.off('focus', '#'+widget.options.tableName+' td[contenteditable]');
        widget.element.off('keypress', '#'+widget.options.tableName+' td[contenteditable]');
        widget.element.off('keyup', '#'+widget.options.tableName+' td[contenteditable]');
        widget.element.off('blur', '#'+widget.options.tableName+' td[contenteditable]');
        widget.element.off('enter', '#'+widget.options.tableName+' td[contenteditable]');
        widget.element.off('change', '#'+widget.options.tableName+' td select');
        widget.element.off('click', '#'+widget.options.tableName+'>tbody .btn-delete');
        widget.element.off('click', '#'+widget.options.tableName+'>tbody .btn-child');
        widget.element.off('click', '#'+widget.options.tableName+'>tbody>tr>td>.btn-open');
        widget.element.off('click', '#'+widget.options.tableName+'>tfoot .btn-add');
        widget.element.off('blur', '#selectedRecord>form .form-group input');
        widget.element.off('enter', '#selectedRecord>form .form-group input');
        widget.element.off('focus', '#selectedRecordOptions form>table>tbody>tr>td.optionstr');
        widget.element.off('keypress', '#selectedRecordOptions form>table>tbody>tr>td.optionstr');
        widget.element.off('keyup', '#selectedRecordOptions form>table>tbody>tr>td.optionstr');
        widget.element.off('blur', '#selectedRecordOptions form>table>tbody>tr>td.optionstr');
        widget.element.off('enter', '#selectedRecordOptions form>table>tbody>tr>td.optionstr');
        widget.element.off('change', '#selectedRecordOptions form>table>tbody>tr>td.optionselect>select');
        widget.element.off('click', '#'+widget.options.tableName+'>tbody .btn-moveUp');
        widget.element.off('click', '#'+widget.options.tableName+'>tbody .btn-moveDown');
        widget.element.off('click', '#'+widget.options.tableName+'>tbody .btn-insertBefore');
        widget.element.off('click', '#'+widget.options.tableName+'>tbody .btn-insertAfter');
        widget.element.off('click', '#modal-insert-'+widget.options.entityName+' .btn-primary');
        widget.element.off('keyup', '#modal-insert-'+widget.options.entityName+' .form-control');
        widget.element.off('click', '#'+widget.options.tableName+'>tbody .btn-hide');
        widget.element.off('click', '#'+widget.options.tableName+'>tbody .btn-show');
        widget.element.off('click', '#'+widget.options.tableName+'>tfoot .btn-more');
        widget.element.off('change', '#'+widget.options.tableName+' td input[type=checkbox]');
        widget.element.off('change', '#selectedRecord tbody>tr>td>select');
        widget.element.off('enter', '#selectedRecord tbody>tr>td[contenteditable]');
        // widget.element.off('click', '#selectedRecord .btn-back-to-main');
        widget._debug('widget '+widget.eventNamespace.substring(0, widget.eventNamespace.length - 1).slice(1)+' has been destroyed')
    },


    _getCreateRecordForm: function (){
        var widget = this;
        $modalForm = $('<form/>');
        $modalForm.empty();
            var createInputs = widget.options.create.fields;
            for (var i = 0; i < createInputs.length; ++i)
            {
                var $group = $('<div/>', {'class': 'form-group'});
                $modalForm.append($group);

                var input = createInputs[i];
                var $label;
                var $input;
                switch(input.inputType)
                {
                    case 'text':
                    case 'hidden':
                    case 'password':
                    case 'email':
                    case 'tel':

                        $label = $('<label/>', {'for': input.key}).text(input.name);
                        $input = $('<input/>', {'class': 'form-control', 'type': input.inputType, 'name': input.key, 'value': input.value}).attr('placeholder', input.name);
                        $group.append($label, $input);

                        break;
                    case 'select':
                        if(typeof input.action !=="undefined")
                        {
                            //alert(0);
                            $label = $('<label/>', {'for': input.key}).text(input.name);
                            $input = $('<select/>', {'name': input.key,'class': 'form-control'});
                            $input.append($('<option/>', {'value': 0}).attr('selected','selected').text('Select '+input.name));
                            $group.append($label, $input);

                            widget._appendSelectWithOptions($input, input);
                        }

                        break;

                }
            }
            return $modalForm;
               
    },
    

    _renderCreateRecordBlock: function (){
        var widget = this;
        var $block = $('body').find('#create-block');
        var $modalForm;
        if ($block.length == 0)
        {    
             
            var inputsOption = widget.options.create.fields;
            if(inputsOption.length)
            {
                $modalForm = widget._getCreateRecordForm();
                widget.element.append($('<div/>', {id: 'create-block', 'class': 'record-block'}).append($modalForm).append(
                                        $('<button/>', {'class': 'btn btn-primary btn-create', 'type': 'button'}).text('Create'),
                                        $('<button/>', {'class': 'btn btn-primary btn-cancel', 'type': 'button'}).text('Cancel'))
    
                                )
            }
        }
        else
        $block.show();
    },


    _openCreateRecordModal: function () {
        var widget = this;
        var inputsOption = widget.options.create.fields;
        if(inputsOption.length)
        {
            var $modal = $('body').find('#create-window');
            var $modalForm;
            if ($modal.length == 0)
            {    
                $modalForm = widget._getCreateRecordForm();
                $modal = $('<div/>', {'class': 'modal fade in', 'tabindex': -1, 'role': 'dialog', 'id': 'create-window'}).css('display', 'block').append(
                    $('<div/>', {'class': 'modal-dialog modal-md'}).append(
                        $('<div/>', {'class': 'modal-content'}).append(
                            $('<div/>', {'class': 'modal-header'}).append(
                                $('<button/>', {'class': 'close', 'type': 'button', 'data-dismiss': 'modal'}).text('×')).append(
                                $('<h4/>', {'class': 'title'}).css('text-align','center').text('Create new '+widget.options.entityName.charAt(0).toUpperCase() + widget.options.entityName.substr(1).toLowerCase()))).append(
                            $('<div/>', {'class': 'modal-body'}).append($modalForm)).append(
                            $('<div/>', {'class': 'modal-footer'}).append(
                                $('<button/>', {'class': 'btn btn-primary btn-create', 'type': 'button'}).text('Create')

                            )
                        )
                    )
                );
            }
            $modal.modal();    
        }
    },


    _refresh: function () {
        var widget = this;
        var searchLine = $('<p/>',{id:'search-line'});
        widget.element.empty().append(
            $mainTable = $('<div/>',{id:'main-table-'+widget.options.tableName}).append(
                searchLine.css({'margin': '10px 0px', 'display': widget.options.globalSearch ? 'block' : 'none'}).append(
                    $form = $('<form/>', {id: 'search'+widget.options.tableName, class: 'form-inline'}).css({display: 'inline-block'}).append(
                        $('<div/>', {class: 'form-group'}).append(
                            $('<input/>', {class: 'form-control', type: 'text', name: 'query'}).css({'margin':'0 5px', 'display': widget.options.query ? 'inline' : 'none'}).attr('placeholder','Search...')
                        )
                    )
                )
            )
        );
        if (widget.options.button != false) $form.append($('<button/>', {class: 'btn btn-primary'}).css('margin','0 5px').text(widget.options.button));
        if(widget.options.hasParent) searchLine.prepend($('<button/>', {class: 'btn btn-danger back-btn'}).css('margin','0 5px').text('Back'));

        var form = $('#search'+widget.options.tableName);

        /**
         * Filters
         */

        var filters = widget.options.filters;
        for(var i in filters)
        {
            var value;
            var filter = filters[i];
            var $group = $('<div/>', {class: 'form-group'}).insertBefore($('#search'+widget.options.tableName+' button.btn.btn-primary'));
            if(!filter.type || filter.type == 'text')
            {
                value = '';
                if(filter.value) value = filter.value;
                $('<input/>', {class: 'form-control', name: filter.key, value: value, title: filter.name}).css('margin','0 5px').attr('placeholder', filter.name).appendTo($group);
            }
            if(filter.type == 'select')
            {
                var $input = $('<select/>', {class: 'form-control', 'name': filter.key}).css('margin','0 5px').appendTo($group);

                value = '0';
                if(filter.value) value = filter.value;

                widget._insertOptionsToSelect($input, filter, 0);
            }
            if(filter.type == 'hidden')
            {
                value = '';
                if(filter.value) value = filter.value;
                $('<input/>', {class: 'form-control', name: filter.key, value: value, type: 'hidden'}).insertBefore($('#search'+widget.options.tableName+' button.btn.btn-primary'));
                $group.remove();
            }
        }
        if(filters.length != 0 && widget.options.filtersReset)
        {
            searchLine.find('#search'+widget.options.tableName).append($('<div/>', {class: 'form-group'}).append($('<button/>', {class: 'btn btn-danger reset-btn'}).css('margin','0 5px').text('Reset')))
        }

        /**
         * Header of widget
         */

        if(widget.options.header)
        {
            var headerText = widget.options.header;
            var $hedaer = $('<h3/>').text(headerText);
            widget.element.prepend($hedaer);
        }
        
        var $theadTr = $('<tr/>');
        if (widget.options.list.firstColumnId) $theadTr.append($('<th/>').text('ID'));
        if (widget.options.list.addIndexNumber) $theadTr.append($('<th/>').css('text-align','right').text('N п/п.'));
        var fields = widget.options.list.fields;
        for (var i = 0, len = fields.length; i < len; ++i) $theadTr.append($('<th/>').text(fields[i].name));
        $theadTr.append($('<th/>').text(''));
        if(widget.options.editAccess && widget.options.list.addButton)
        {
            $mainTable.append(
                $('<table/>', {id: widget.options.tableName}).append(
                    $('<thead/>').append($theadTr),
                    $('<tbody/>'),
                    $('<tfoot/>').append($('<tr/>').append($('<td/>').append($('<a/>', {class: 'btn btn-add'}).text('add'))))
                )
            );
        }
        else
        {
            $mainTable.append(
                $('<table/>', {id: widget.options.tableName}).append(
                    $('<thead/>').append($theadTr),
                    $('<tbody/>'),
                    $('<tfoot/>')
                )
            );
        }
        /* @author Denis Kucher <dkucher88@gmail.com>
        * @copyright Copyright &copy; 2017
        * @updated 2017.06.22 added to options list burron "moreButton" 
        * INFO:
        * onclick call function _loadMoreRecords()
        */
        if(widget.options.editAccess && widget.options.list.moreButton)
        {
            $('table#'+widget.options.tableName+' tfoot tr').append(
                $('<td/>', {colspan:widget.options.list.fields.length+1}).append(
                    $('<a/>', {class: 'btn btn-more'}).text('more')
                )
            );
        }

        var footer = widget.options.list.footer;
        if(footer.length) {
            var footerTr = widget.element.find('table#'+widget.options.tableName+'>tfoot').prepend($('<tr/>', {class: 'footer'}));
            var columnsCount = widget.options.list.fields.length+2;
            for(var i=0; i<columnsCount; i++)
            {
                var $footerTd = $('<td/>').html('');
                for(var y in footer)
                {
                    var footerItem = footer[y];
                    if(footerItem.colNumber == i)
                    {
                        if($footerTd.html() != '') $footerTd.append($('<span/>', {class: 'separator'}).html('/'));
                        if(footerItem.function == 'sum') $footerTd.css('text-align',footerItem.textAlign).append($('<span/>', {class: 'sum'+footerItem.key}).html('0'));
                        if(footerItem.function == 'async') {
                            var $span = ($('<span/>', {class: 'async'+footerItem.name}).appendTo($footerTd));
                            widget._getAsyncFooterItem($span, footerItem)
                        }
                    }
                }
                widget.element.find('table#'+widget.options.tableName+'>tfoot>tr.footer').append($footerTd);
            }
            footerTr.find('td:first').css({'text-align':'right','font-weight':'bold'}).text(widget.options.list.footer[0].name);
        }

        if(widget.options.childManager)
        {
            $('#spa').append($('<div/>', {id: widget.options.childManager.id}));
        }


        widget._refreshRecords(form.serializeObject());
        setTimeout(function() {widget.element.find('form input[name=query]').focus()});
    },
    
    
    _setValue: function (_action, _recordId, _fieldName, _value, _success) {
        var widget = this;
        var $tr = widget.element.find('#'+widget.options.tableName+' tr[data-id='+_recordId+']');
        var $td = $tr.find('td[data-key='+_fieldName+']');
        if(widget.options.editAccess)
        {
            sendRequest({
                action: _action,
                data: {id: _recordId, value: _value},
                successHandler: function (_callbackParams) {
                    var response = _callbackParams.response;
                    if (!response.success) {
                        $td.text($td.data('value'));
                        alert(response.message);
                    } else {
                        $td.data('value',_value).blur();

                        var footer = widget.options.list.footer;
                        for(var i in footer)
                        {
                            var footerItem = footer[i];
                            if(footerItem.function == 'sum' && footerItem.key == _fieldName)
                            {
                                var newSum = 0;
                                var $tdLength = widget.element.find('#'+widget.options.tableName+'>tbody>tr>td[data-key='+footerItem.key+']').length;
                                for(var y=0; y<$tdLength; y++)
                                {
                                    var val = widget.element.find('#'+widget.options.tableName+'>tbody>tr>td[data-key='+footerItem.key+']:eq('+y+')').html();
                                    console.log(val);
                                    newSum = newSum + parseInt(val);
                                }
                                if (footerItem.number) newSum = newSum.toFixed(Number(footerItem.number));
                                console.log(newSum);
                                widget.element.find('#'+widget.options.tableName+'>tfoot>tr.footer>td>span.sum'+footerItem.key).html(newSum);
                            }
                        }
                        if (_success) _success(response.data);
                        $tr.next().children().eq($td.index()).focus();
                    }
                }
            });
        }
        else
        {
            $td.text($td.data('value'));
            alert('You have not access to edit '+widget.options.tableName+'!');
        }

    },


    _objDump: function (object) {
        var out = "";
        if(object && typeof(object) == "object"){
            for (var i in object) {
                out += i + ": " + object[i] + "\n";
            }
        } else {
            out = object;
        }
            alert(out);
    },


    /**
     * _refreshRecords method
     *
     * @author Alexander Kudrya <alexkudrya91@gmail.com>
     * @copyright Copyright &copy; 2017
     * @created 2017.06.22 added "_targetId" to set target ID from options if it need
     *
     * INFO:
     * use method _appendRecord
     */
    _refreshRecords: function (_data) {
        var widget = this;
        //find filters with static value...
        var filters = widget.options.filters;
        for (var i in filters)
        {
            var filter = filters[i];

            if(filter.value !== undefined){
            if(_data)
            {
                    eval('_data.'+filter.key+'='+filter.value);
            }
            else
            {
                    eval('_data={'+filter.key+': '+filter.value+'}');
                }
            }
        }

        $('#'+widget.options.tableName+'>tbody').empty();
        sendRequest({
            action: widget.options.moduleName+'.get'+widget.options.tableName,
            data: _data,
            successHandler: function(_callbackParams) {
                var response = _callbackParams.response;
                if (!response.success) alert(response.message);
                else {
                    var data = response.data;
                    var records = data.records;
                    if (records && records.length) {
                        widget.element.find('table#'+widget.options.tableName+'>tfoot>tr.footer>td>span').html('0');// by Denis Kucher -- clean .sum, calc was wrong
                        for (var i = 0, len = records.length; i < len; ++i) {
                            var record = records[i];
                            widget._appendRecord(record.id, record, 'end');
                        }
                    };
                    widget._renderIndexRecord();
                }
            }
        });
    },

    /**
     * _renderIndexRecord method
     *
     * @author Denis Kucher <dkucher88@gmail.com>
     * @copyright Copyright &copy; 2017
     * @created 2017.06.25
     */
     _renderIndexRecord:function(){
        var widget = this;
        if (widget.options.list.addIndexNumber) {
            var index = 1;
            var tbodyTr = widget.element.find('#'+widget.options.tableName+'>tbody tr');
            $.each(tbodyTr, function(value){
                $(this).find('td[data-key=index]').text(index++);
            });    
        }else{return;}
     },

     /**
     * _loadMoreRecords method
     *
     * @author Denis Kucher <dkucher88@gmail.com>
     * @copyright Copyright &copy; 2017
     * @created 2017.06.22
     *
     * INFO:
     * use method _appendRecord
     */
    _loadMoreRecords: function (_data, _baseId) {
        var widget = this;

        //find filters with static value...

        var filters = widget.options.filters;
        for (var i in filters)
        {
            var filter = filters[i];

            if(filter.value !== undefined){
            if(_data)
            {
                    eval('_data.'+filter.key+'='+filter.value);
            }
            else
            {
                    eval('_data={'+filter.key+': '+filter.value+'}');
                }
            }
        }
        var data = _data;
        data.baseId = _baseId;

        sendRequest({
            action: widget.options.moduleName+'.get'+widget.options.tableName,
            data: _data,
            successHandler: function(_callbackParams) {
                var response = _callbackParams.response;
                if (!response.success) alert(response.message);
                else {
                    var data = response.data;
                    var records = data.records;
                    if (records && records.length) {
                        for (var i = 0, len = records.length; i < len; ++i) {
                            var record = records[i];
                            widget._appendRecord(record.id, record, 'end');
                        }
                    }
                }
            }
        });
    },


    /**
     * _renderRecord method
     *
     * @author Alexander Kudrya <alexkudrya91@gmail.com>
     * @copyright Copyright &copy; 2017
     * @updated 2017.05.20 added option "select" to insert into TD dropdown list
     *
     * INFO:
     * use method _renderRecord
     */
    _appendRecord: function (_id, _data, _position, _baseId) {
        var widget = this;
        var $tr = $('<tr/>', {'data-id': _data.id});
        if (widget.options.list.firstColumnId) $tr.append($('<td/>').css('text-align','right').text(_data.id));
        
        if(_position == 'end') {
        widget.element.find('#'+widget.options.tableName+'>tbody').append($tr);
        }
        else if(_position == 'before') {
            var beforeTr = widget.element.find('#'+widget.options.tableName+'>tbody>tr[data-id='+_baseId+']');
            $tr.insertBefore(beforeTr);
        }else if(_position == 'after') {
            var afterTr = widget.element.find('#'+widget.options.tableName+'>tbody>tr[data-id='+_baseId+']');
            $tr.insertAfter(afterTr);
        }else if(_position == 'start') {
            widget.element.find('#'+widget.options.tableName+'>tbody').prepend($tr);
        }

        widget._renderRecord(_id, _data, $tr)
    },


    /**
     * _insertBeforeRecord method
     *
     * @author Alexander Kudrya <alexkudrya91@gmail.com>
     * @copyright Copyright &copy; 2017
     *
     * INFO:
     * use method _renderRecord
     */
    _insertBeforeRecord: function (_id, _data, _beforeId) {
        var widget = this;

        var beforeTr = widget.element.find('#'+widget.options.tableName+'>tbody>tr[data-id='+_beforeId+']');
        $tr.insertBefore(beforeTr);
        widget._addRecord(_id, _data, $tr)
    },


    /**
     * _insertAfterRecord method
     *
     * @author Alexander Kudrya <alexkudrya91@gmail.com>
     * @copyright Copyright &copy; 2017
     *
     * INFO:
     * use method _addRecord
     */
    _insertAfterRecord: function (_id, _data, _afterId) {
        var widget = this;

        var afterTr = widget.element.find('#'+widget.options.tableName+'>tbody>tr[data-id='+_afterId+']');
        $tr.insertAfter(afterTr);
        widget._addRecord(_id, _data, $tr)
    },
    /**
     * _renderEditableRecord method
     *
     * @author Denis Kucher <dkucher88@gmail.com>
     * @copyright Copyright &copy; 2017
     * 
     * INFO:
     * used as last parametr in _setValue method
     */
     _renderEditableRecord: function(_data){
        var widget = this;
        var data = _data.record;
        var $tr = widget.element.find('#'+widget.options.tableName+'>tbody>tr[data-id='+data.id+']');
        widget._appendRecord(data.id, data, 'after', data.id);
        $tr.remove();
        widget._renderIndexRecord();
     },

    /**
     * _renderRecord method
     *
     * @author Alexander Kudrya <alexkudrya91@gmail.com>
     * @copyright Copyright &copy; 2017
     * @updated 2017.05.20 added option "select" to insert into TD dropdown list
     * @updated 2017.06.01 added options "moveUp", "moveDown", "insertBefore", "insertAfter"
     *
     * INFO:
     * use method _insertOptionsToSelect
     */
    _renderRecord: function (_id, _data, $tr) {
        var widget = this;
        var fields = widget.options.list.fields;
        if (widget.options.list.addIndexNumber) $tr.prepend($('<td/>',{'data-key':'index'}).css('text-align','right').text('1'));
        for (var i = 0, len = fields.length; i < len; ++i)
        {
            var field = fields[i];
            if(!field.type || field.type == 'text')
            {
                if(!widget.options.editAccess) field.editable = false;
                var value = null;
                if(field.key.indexOf('.') == -1) value = _data[field.key] ? _data[field.key] : '';
                else
                {
                    var keys = field.key.split('.');
                    value = _data[keys[0]][keys[1]] ? _data[keys[0]][keys[1]] : '';
                }

                var footer = widget.options.list.footer;
                for(var y in footer)
                {
                    var footerItem = footer[y];
                    if(footerItem.key === field.key)
                    {
                        if(footerItem.function == 'sum')
                        {
                            var currentFooterItemVal = widget.element.find('table#'+widget.options.tableName+'>tfoot>tr.footer>td:eq('+footerItem.colNumber+')>.sum'+footerItem.key).html();
                            if(value == '' || value === undefined) value = 0;
                            if (footerItem.number) value = Number(value).toFixed(Number(footerItem.number));// added by Denis Kucher 2017.07.06
                            widget.element.find('table#'+widget.options.tableName+'>tfoot>tr.footer>td:eq('+footerItem.colNumber+')>.sum'+footerItem.key).html((+currentFooterItemVal+(+value)).toFixed(Number(footerItem.number)));
                        }
                    }
                }


                var title = '';
                if(field.modalLang || field.editable)title = 'Click to edit';
                
                if (field.number) {
                    value = Number(value).toFixed(Number(field.number));// added by Denis Kucher 2017.06.23
                    $td.attr('number',field.number);
                    numberFlag = true;
                }

                $tr.append($td = $('<td/>', {'contenteditable': field.editable, 'data-key': field.key, 'modallang': field.modalLang, 'title': title}).css('text-align', field.textAlign ? field.textAlign : 'left').text(value));
                
            }
            if(field.type == 'select')
            {
                var value = eval('_data.'+field.key);
                var $input = $('<select/>', {'name': field.key});
                $tr.append($('<td/>', {'data-key': field.key, title: 'Dropdown list'}).append($input));
                if(!widget.options.editAccess) $input.attr('disabled', 'disabled');
                widget._insertOptionsToSelect($input, field, value);
            }
            if(field.type == 'checkbox')
            {
                var $input = $('<input/>', {type: 'checkbox', 'name': field.key});
                var title = '';
                if(field.modalLang || field.editable) title = 'Check to '+ field.key;
                if (!field.editable) $input.attr('disabled','disabled');
                $tr.append($('<td/>', {'data-key': field.key, 'modallang': field.modalLang, 
                'title': title}).css('text-align', 'center').append($input));
                var value = eval('_data.'+field.key);
                (value == '1')? $input.attr('checked','checked').val(value) : $input.val(value); 
                
            }
        }


        var $buttonsTd = $('<td/>');

        if(widget.options.list.moveUp && widget.options.editAccess)$buttonsTd.append($('<a/>', {class: 'btn btn-moveUp', title: 'Move Up'}).text('↑'));
        if(widget.options.list.moveDown && widget.options.editAccess)$buttonsTd.append($('<a/>', {class: 'btn btn-moveDown', title: 'Move Down'}).text('↓'));
        if(widget.options.list.insertBefore && widget.options.editAccess)$buttonsTd.append($('<a/>', {class: 'btn btn-insertBefore', title: 'Insert Before'}).text('↰'));
        if(widget.options.list.insertAfter && widget.options.editAccess)$buttonsTd.append($('<a/>', {class: 'btn btn-insertAfter', title: 'Insert After'}).text('↲'));

        if(widget.options.list.deletable && widget.options.editAccess)
        {
            var delText = 'delete';
            if(widget.options.list.moveDown || widget.options.list.moveUp || widget.options.list.insertAfter || widget.options.list.insertBefore) delText = 'x';
            $buttonsTd.append($('<a/>', {class: 'btn btn-delete', title: 'Delete'}).text(delText));
        }

        if(widget.options.childManager)
        {
            if(widget.options.childManager.button) $buttonsTd.append($('<a/>', {class: 'btn btn-child'}).text(widget.options.childManager.button));
            else $buttonsTd.append($('<a/>', {class: 'btn btn-child', title: 'Open'}).text('child'));
        }

        if(widget.options.view.enable && widget.options.view.renderPlace === 'body') $buttonsTd.append($('<a/>', {class: 'btn btn-open'}).text(widget.options.view.button));
        if(widget.options.view.enable && widget.options.view.renderPlace === 'table') $buttonsTd.append($('<a/>', {class: 'btn btn-show'}).text(widget.options.view.button));

        $tr.append($buttonsTd);


        /**
         * Render inner table...
         */

        if(widget.options.view.enable && widget.options.view.renderPlace === 'table')
        {
            var innerTableTd = $('<td/>').css({padding: 0, border: 0, display: 'none'});
            $tr.append(innerTableTd);

            var relations = widget.options.view.relations;
            for(var i in relations)
            {
                var relation = relations[i];

                $.getScript(
                    '/application/modules/'+widget.options.moduleName+'/widgets/'+relation.widgetName.toLowerCase()+'.js'
                ).fail(function(jqxhr, settings, exception) {
                    alert('Failed to load relation block widget script.');
                }).done(function(script, textStatus) {

                    /**
                     * Create <div/> for widget if it not created yet
                     */

                    if(!innerTableTd.find('.'+relation.divClass).length)
                    {
                        innerTableTd.append(
                            $('<div/>', {class: relation.divClass}).css({display: 'none'})
                        );
                    }
                    else
                    {
                        // innerTableTd.find('.'+relation.divClass).empty();
                    }

                    /**
                     * Destroy widget if it already created
                     */
                    if(innerTableTd.find('.'+relation.divClass).is(':xb-'+relation.widgetName))
                    {
                        eval('$("#"+widget.options.tableName+">tbody>tr>td>."+relation.divClass).'+relation.widgetName+'("destroy")');
                    }

                    /**
                     * Create new widget
                     */
                    eval('$.xb.'+relation.widgetName+'({filters: [{key: "'+relation.filter+'", value: "'+_id+'", type: "hidden"}], '+relation.filter+': "'+_id+'"}, "#'+widget.options.tableName+'>tbody>tr[data-id='+_id+']>td>.'+relation.divClass+'")');
                });
            }
        }
    },

    /**
     * _insertOptionsToSelect method
     *
     * @author Alexander Kudrya <alexkudrya91@gmail.com>
     * @copyright Copyright &copy; 2017
     * @created 2017.05.20
     *
     * INFO:
     * used by method _appendRecord
     */
    _insertOptionsToSelect: function ($input, input, value){
        var widget = this;

        var action = '';
        if(input.action.indexOf('.') + 1) action = input.action;
        else action = widget.options.moduleName +'.'+ input.action;

        sendRequest({
            action: action,
            data: {},
            successHandler: function (_callbackParams) {
                var response = _callbackParams.response;
                if (!response.success) {
                    alert(response.message);
                } else {
                    var data = response.data;
                    var records = data.records;

                    if(value == '0' || value == 0) $input.append($('<option/>', {selected: 'selected', value: ''}).text('All '+input.name));

                    for(var recordId in records)
                    {
                        var record = records[recordId];
                        if(value == recordId) $input.append($('<option/>', {'value': recordId, selected: 'selected'}).text(record));
                        else $input.append($('<option/>', {'value': recordId}).text(record));
                    }
                }
            }
        });
    },


    /**
     * _createRecordAk method
     *
     * @author Alexander Kudrya <alexkudrya91@gmail.com>
     * @copyright Copyright &copy; 2017
     * @created 2017.04.27
     * @updated 2017.05.03
     * @updated 2017.05.20 fix select input
     * @updated 2017.05.22 add new parameters: maxLength, minLength, uppercase
     *
     * INFO:
     * use method _appendSelectWithOptions
     */
    _renderCreateModalFormAk: function (method) {
        var widget = this;
        method = typeof method !== 'undefined' ? method : 'end';
        if(widget.options.editAccess)
        {
            var inputsOption = widget.options.createInputs;
            if(inputsOption.length == 0)
            {
                var name = prompt('Name:');
                if (name) {
                    sendRequest({
                        action: widget.options.moduleName+'.create'+widget.options.entityName,
                        data: {name: name},
                        successHandler: function(_callbackParams) {
                            var response = _callbackParams.response;
                            if (!response.success) alert(response.message);
                            else {
                                var data = response.data;
                                widget._appendRecord(data.id, data.data);
                            }
                        }
                    });
                }
            }
            else
            {
                // step 1 - create modal window if it is not created yet...

                var $modal = $('body').find('#createWindow');
                var $modalForm;
                if ($modal.length == 0)
                {
                    $modalForm = $('<form/>').attr('autocomplete', 'off');
                    $modal = $('<div/>', {'class': 'modal fade in', 'tabindex': -1, 'role': 'dialog', 'id': 'createWindow'}).css('display', 'block').append(
                        $('<div/>', {'class': 'modal-dialog modal-md'}).append(
                            $('<div/>', {'class': 'modal-content'}).append(
                                $('<div/>', {'class': 'modal-header'}).append(
                                    $('<button/>', {'class': 'close', 'type': 'button', 'data-dismiss': 'modal'}).text('×')).append(
                                    $('<h4/>', {'class': 'title'}).css('text-align','center').text('Create new '+widget.options.entityName.charAt(0).toUpperCase() + widget.options.entityName.substr(1).toLowerCase()))).append(
                                $('<div/>', {'class': 'modal-body'}).append(
                                    $modalForm)).append(
                                $('<div/>', {'class': 'modal-footer'}).append(
                                    $('<button/>', {'class': 'btn btn-primary', 'type': 'button'}).text('Create')
                                        .bind('click', runCreating)
                                )
                            )
                        )
                    );
                }
                else
                {
                    $modalForm = $('body').find('#createWindow form');

                    $('body').find('#createWindow .btn-primary').unbind('click');
                    $('body').find('#createWindow .btn-primary')
                        .bind('click', runCreating)
                }

                // step 2 - we clear modal form if it is not empty, and insert into it input fields...

                $modalForm.empty();
                var createInputs = widget.options.createInputs;
                var inputsQueue = [];
                for (var i = 0; i < createInputs.length; ++i)
                {
                    var $group = $('<div/>', {'class': 'form-group'});
                    $modalForm.append($group);

                    var input = createInputs[i];
                    var $label;
                    var $input;
                    var $help;
                    inputsQueue[i] = input;
                    switch(input.type)
                    {
                        case 'text':
                        case 'password':
                        case 'email':
                        case 'tel':

                            $label = $('<label/>', {'for': input.key}).text(input.name);
                            $input = $('<input/>', {'class': 'form-control', 'type': input.type, 'name': input.key}).attr({'placeholder': input.name, 'autocomplete': 'off'});
                            $help = $('<span/>', {id: input.key+'Help', class: 'help-block'});
                            if(input.maxLength) $input.attr('maxlength', input.maxLength);
                            if(input.uppercase) $input.css('text-transform', 'uppercase');
                            $group.append($label, $input, $help);

                            break;
                        case 'select':
                            if(typeof input.action !=="undefined")
                            {
                                $label = $('<label/>', {'for': input.key}).text(input.name);
                                $input = $('<select/>', {'name': input.key,'class': 'form-control'});
                                $help = $('<span/>', {id: input.key+'Help', class: 'help-block'});
                                $input.append($('<option/>', {'value': 0}).attr('selected','selected').text('Select '+input.name));
                                $group.append($label, $input, $help);

                                widget._refreshSelectOptions($input, input);
                            }

                            break;
                        case 'date':
                            $label = $('<label/>', {'for': input.key}).text(input.name);
                            $input = $('<input/>', {'class': 'form-control', 'type': 'text', 'name': input.key, 'id': 'datepicker'+input.key}).attr('placeholder', input.name);
                            $help = $('<span/>', {id: input.key+'Help', class: 'help-block'});
                            var $script = $('<script/>').text('' +
                                '$(function(){$( "#datepicker'+input.key+'" )' +
                                '.datepicker().datepicker( "option", "dateFormat", "yy-mm-dd")' +
                                '.datepicker( "option", "showAnim", "fold");});');
                            $group.append($script, $label, $input, $help);
                    }
                }

                $modal.modal();

                var inputsLen = inputsQueue.length-1;

                function runCreating()
                {
                    var data = widget._takeValuesFromCreateFormAk();

                    widget._validateCreateFormAk(data, true, 0, inputsLen, $modalForm, method);
                }
            }
        }
        else alert('You have not access to create new '+widget.options.entityName+'!');
    },


    _takeValuesFromCreateFormAk: function(){
        var widget = this;
        var data = {};
        var createInputs = widget.options.createInputs;

        for (var i = 0; i < createInputs.length; i++)
        {
            var input = createInputs[i];
            var $tag = '';
            var value = '';
            switch(input.type)
            {
                case 'text':
                case 'password':
                case 'email':
                case 'tel':
                case 'date':

                    $tag = $('body').find('#createWindow form input[name='+input.key+']');
                    value = $tag.val();
                    data[input.key] = value;

                    break;
                case 'select':
                    $tag = $('body').find('#createWindow form select[name='+input.key+'] option:selected');
                    value = $tag.val();
                    data[input.key] = value;

                    break;
                case 'hidden':
                    value = eval('widget.options.'+input.value);
                    data[input.key] = value;
                    break;
            }
        }

        return data;
    },


    _validateCreateFormAk: function(data, ready, queue, inputsLen, $modalForm, method) {
        var widget = this;
        ready = typeof ready !== 'undefined' ? ready : true;

        if((queue) > inputsLen)
        {
            if(ready) widget._createRecordAk(data, method);
            return;
        }
        var valid = ready;
        var createInputs = widget.options.createInputs;
        var input = createInputs[queue];
        if(input.required)
        {
            switch(input.type)
            {
                case 'text':
                case 'password':
                case 'email':
                case 'tel':
                case 'date':

                    var value = data[input.key];
                    var $tag = $('body').find('#createWindow form input[name='+input.key+']');

                    var minLength = 0;
                    if(input.minLength) minLength = input.minLength;

                    var maxLength = 99999999;
                    if(input.maxLength) maxLength = input.maxLength;

                    if(value.length == 0)
                    {
                        valid = false;
                        $tag.closest('.form-group').addClass('has-error');
                        $tag.closest('.form-group').removeClass('has-success');

                        $modalForm.find('#'+input.key+'Help').text(input.name+' cannot be empty').closest('.form-group').addClass('has-error').find('input[name='+input.key+']')
                            .bind('keypress', function () {
                                $(this).closest('.form-group').removeClass('has-error').find('span').empty();
                            });

                        queue++;
                        widget._validateCreateFormAk(data, valid, queue, inputsLen, $modalForm, method);
                    }
                    else
                    {
                        if(value.length > maxLength)
                        {
                            valid = false;
                            $tag.closest('.form-group').addClass('has-error');
                            $tag.closest('.form-group').removeClass('has-success');

                            $modalForm.find('#'+input.key+'Help').text(input.name+' is too long, max length = '+input.maxLength).closest('.form-group').addClass('has-error').find('input[name='+input.key+']')
                                .bind('keypress', function () {
                                    $(this).closest('.form-group').removeClass('has-error').find('span').empty();
                                });

                            queue++;
                            widget._validateCreateFormAk(data, valid, queue, inputsLen, $modalForm, method);
                        }
                        else
                        {
                            if(value.length < minLength)
                            {
                                valid = false;
                                $tag.closest('.form-group').addClass('has-error');
                                $tag.closest('.form-group').removeClass('has-success');

                                $modalForm.find('#'+input.key+'Help').text(input.name+' is too short, min length = '+input.minLength).closest('.form-group').addClass('has-error').find('input[name='+input.key+']')
                                    .bind('keypress', function () {
                                        $(this).closest('.form-group').removeClass('has-error').find('span').empty();
                                    });

                                queue++;
                                widget._validateCreateFormAk(data, valid, queue, inputsLen, $modalForm, method);
                            }
                            else
                            {
                                if(input.unique)
                                {
                                    if(typeof input.action !=="undefined")
                                    {
                                        sendRequest({
                                            action: widget.options.moduleName+'.'+input.action,
                                            data: {value: value},
                                            successHandler: function(_callbackParams) {
                                                var response = _callbackParams.response;
                                                if (!response.success) alert(response.message);
                                                else {
                                                    var resp = response.data.data;
                                                    if(!resp)
                                                    {
                                                        valid = false;

                                                        $tag.closest('.form-group').addClass('has-error');
                                                        $tag.closest('.form-group').removeClass('has-success');
                                                        $modalForm.find('#'+input.key+'Help').text('This '+input.name+' aready Exist').closest('.form-group').addClass('has-error').find('input[name='+input.key+']')
                                                            .bind('keypress', function () {
                                                                $(this).closest('.form-group').removeClass('has-error').find('span').empty();
                                                            });

                                                        queue++;
                                                        widget._validateCreateFormAk(data, valid, queue, inputsLen, $modalForm, method);
                                                    }
                                                    else
                                                    {
                                                        $tag.closest('.form-group').addClass('has-success');
                                                        $tag.closest('.form-group').removeClass('has-error');

                                                        queue++;
                                                        widget._validateCreateFormAk(data, valid, queue, inputsLen, $modalForm, method);
                                                    }
                                                }
                                            }
                                        });
                                    }
                                }
                                else
                                {
                                    $tag.closest('.form-group').addClass('has-success');
                                    $tag.closest('.form-group').removeClass('has-error');

                                    queue++;
                                    widget._validateCreateFormAk(data, valid, queue, inputsLen, $modalForm, method);
                                }
                            }
                        }
                    }

                    break;
                case 'select':

                    var value = data[input.key];
                    var $tag = $modalForm.find('select[name="'+input.key+'"]');

                    if(value == '0' || value == 0 || value.length == 0)
                    {
                        valid = false;
                        $tag.closest('.form-group').addClass('has-error');
                        $tag.closest('.form-group').removeClass('has-success');

                        $modalForm.find('#'+input.key+'Help').text('Please, select a '+input.name).closest('.form-group').addClass('has-error').find('select[name='+input.key+']')
                            .bind('change', function () {
                                $(this).closest('.form-group').removeClass('has-error').find('span').empty();
                            });

                        queue++;
                        widget._validateCreateFormAk(data, valid, queue, inputsLen, $modalForm, method);
                    }
                    else
                    {
                        $tag.closest('.form-group').addClass('has-success');
                        $tag.closest('.form-group').removeClass('has-error');

                        queue++;
                        widget._validateCreateFormAk(data, valid, queue, inputsLen, $modalForm, method);
                    }

                    break;
            }
        }
        else
        {
            var value = data[input.key];
            switch(input.type)
            {
                case 'text':
                case 'password':
                case 'email':
                case 'tel':
                case 'date':
                    var maxLength = 99999999;
                    if(input.maxLength) maxLength = input.maxLength;
                    if(value.length > maxLength)
                    {
                        valid = false;
                        $tag.closest('.form-group').addClass('has-error');
                        $tag.closest('.form-group').removeClass('has-success');

                        $modalForm.find('#'+input.key+'Help').text(input.name+' is too long, max length = '+input.maxLength).closest('.form-group').addClass('has-error').find('input[name='+input.key+']')
                            .bind('keypress', function () {
                                $(this).closest('.form-group').removeClass('has-error').find('span').empty();
                            });

                        queue++;
                        widget._validateCreateFormAk(data, valid, queue, inputsLen, $modalForm, method);
                    }
                    else
                    {
                        queue++;
                        widget._validateCreateFormAk(data, valid, queue, inputsLen, $modalForm, method);
                    }

                    break;
                case 'hidden':
                case 'select':
                    queue++;
                    widget._validateCreateFormAk(data, valid, queue, inputsLen, $modalForm, method);

                    break;
            }
        }
    },


    _createRecordAk: function (data, method) {
        var widget = this;
        var $modal = $('body').find('#createWindow');
        sendRequest({
            action: widget.options.moduleName+'.create'+widget.options.entityName,
            data: data,
            successHandler: function(_callbackParams) {
                var response = _callbackParams.response;
                if (!response.success) alert(response.message);
                else {
                    switch (method)
                    {
                        case 'end':
                            var data = response.data;
                            widget._appendRecord(data.id, data.data);
                            $modal.modal('hide');

                            break;

                        case 'before':
                            var data = response.data;
                            widget._insertBeforeRecord(data.id, data.data, widget.options.beforeId);
                            $modal.modal('hide');

                            widget.options.createInputs.splice(widget.options.createInputs.length-1, 1);

                            break;

                        case 'after':
                            var data = response.data;
                            widget._insertAfterRecord(data.id, data.data, widget.options.afterId);
                            $modal.modal('hide');

                            widget.options.createInputs.splice(widget.options.createInputs.length-1, 1);

                            break;
                    }
                }
            }
        });
    },


    _createRecordIp: function (_data) {
        var widget = this;
        sendRequest({
            action: widget.options.moduleName+'.create'+widget.options.entityName,
            data: _data,
            successHandler: function(_callbackParams) {
                var response = _callbackParams.response;
                if (!response.success) alert(response.message);
                else {
                    var data = response.data;
                    var $modal = $('body').find('#create-window');
                    if($modal.length){
                        $modal.modal('hide');
                        //$modal.find('.form-control').val('');
                        $modal.find('select[name=userId]').val(0);
                    }
                    var create_block = $('body').find('#create-block');
                    if(create_block.length){
                        create_block.hide();
                        //create_block.find('.form-control').val('');
                        create_block.find('select[name=userId]').val(0);
                    }
                    widget._appendRecord(data.id, data.data);
                }
            }
        });
    },


    /**
     * _appendSelectWithOptions method
     *
     * @author Alexander Kudrya <alexkudrya91@gmail.com>
     * @copyright Copyright &copy; 2017
     * @created 2017.05.03
     *
     * INFO:
     * used by method _createRecord
     */
    _refreshSelectOptions: function ($input, input){
        var widget = this;

        var action = '';
        // console.log(input.action.indexOf('.') + 1);
        if(input.action.indexOf('.') + 1) action = input.action;
        else action = widget.options.moduleName +'.'+ input.action;

        sendRequest({
            action: action,
            data: {},
            successHandler: function (_callbackParams) {
                var response = _callbackParams.response;
                if (!response.success) {
                    alert(response.message);
                } else {
                    var data = response.data;
                    var records = data.records;

                    for(var recordId in records)
                    {
                        var record = records[recordId];
                        $input.append($('<option/>', {'value': recordId}).text(record))
                    }
                }
            }
        });
    },
    
    
    _deleteRecord: function (_id) {
        var widget = this;

        var $tr = widget.element.find('#'+widget.options.tableName+'>tbody>tr[data-id='+_id+']');

        var footer = widget.options.list.footer;
        for(var i in footer)
        {
            var footerItem = footer[i];
                if(footerItem.function == 'sum' && $tr.find('td[data-key='+footerItem.key+']').length)
                {
                    var $tdVal = $tr.find('td[data-key='+footerItem.key+']').html();
                    var currentFooterItemVal = widget.element.find('table#'+widget.options.tableName+'>tfoot>tr.footer>td:eq('+footerItem.colNumber+')>.sum'+footerItem.key).html();
                    widget.element.find('table#'+widget.options.tableName+'>tfoot>tr.footer>td:eq('+footerItem.colNumber+')>.sum'+footerItem.key).html(parseInt(currentFooterItemVal)-parseInt($tdVal));
                }
        }

        if(widget.options.editAccess)
        {
            if (confirm('Delete record?')) {
                sendRequest({
                    action: widget.options.moduleName+'.delete'+widget.options.entityName,
                    data: {id: _id},
                    successHandler: function(_callbackParams) {
                        var response = _callbackParams.response;
                        if (!response.success) alert(response.message);
                        else {
                            $tr.remove();
                            widget._renderIndexRecord();
                        }
                    }
                });
            }
        }
        else alert('You have not access to delete '+widget.options.entityName+'!');
    },


    /**
     * _openMultiLangModal method
     *
     * @author Alexander Kudrya <alexkudrya91@gmail.com>
     * @copyright Copyright &copy; 2017
     * @created 2017.04.27
     */
    _openMultiLangModal: function (_rowId, _fieldName){
        var widget = this;
        sendRequest({
        action: widget.options.moduleName+'.getmultilang'+widget.options.tableName,
        data: {id: _rowId, fieldName: _fieldName},
        successHandler: function(_callbackParams) {
            var response = _callbackParams.response;
            if (!response.success) alert(response.message);
            else {
                var data = response.data;
                var records = data.records;
                var $modal = $('body').find('#multilang');
                var $modalForm;
                if ($modal.length == 0)
                {
                    $modalForm = $('<form/>');
                    $modal = $('<div/>', {'class': 'modal fade in', 'tabindex': -1, 'role': 'dialog', 'id': 'multilang'}).css('display', 'block').append(
                        $('<div/>', {'class': 'modal-dialog modal-md'}).append(
                            $('<div/>', {'class': 'modal-content'}).append(
                                $('<div/>', {'class': 'modal-header'}).append(
                                    $('<button/>', {'class': 'close', 'type': 'button', 'data-dismiss': 'modal'}).text('×')).append(
                                    $('<h4/>', {'class': 'title'}).css('text-align','center').text('Edit '+widget.options.entityName.charAt(0).toUpperCase() + widget.options.entityName.substr(1).toLowerCase()+' '+_fieldName))).append(
                                $('<div/>', {'class': 'modal-body'}).append(
                                    $modalForm)).append(
                                $('<div/>', {'class': 'modal-footer'}).append(
                                    $('<button/>', {'class': 'btn btn-primary', 'type': 'button'}).text('Save')
                                        .bind('click', function(){
                                            var langObj = {};

                                            $.each($('.modal input[name]'), function(value){
                                                var nameAttr = $(this).attr('name');
                                                var langAttr = $(this).val();

                                                langObj[nameAttr] = langAttr;
                                            });

                                            sendRequest({
                                                action: widget.options.moduleName+'.setmultilang'+widget.options.tableName,
                                                data: {id: _rowId, langObj: langObj, fieldName: _fieldName},
                                                successHandler: function(_callbackParams) {
                                                    var response = _callbackParams.response;
                                                    if (!response.success) alert(response.message);
                                                    else
                                                    {
                                                        $modal.modal('hide');
                                                        var $tr = widget.element.find('#'+widget.options.tableName+' tr[data-id='+_rowId+']');
                                                        $tr.find('td[data-key='+_fieldName+']').text(response.data.name);
                                                    }
                                                }
                                            });
                                        })))));
                }
                else
                {
                    $modalForm = $('body').find('#multilang form');

                    $('body').find('#multilang .btn-primary').unbind('click');
                    $('body').find('#multilang .btn-primary')
                        .bind('click', function(){
                            var langObj = {};

                            $.each($('#multilang input[name]'), function(value){
                                var nameAttr = $(this).attr('name');
                                var langAttr = $(this).val();

                                langObj[nameAttr] = langAttr;
                            });

                            sendRequest({
                                action: widget.options.moduleName+'.setmultilang'+widget.options.tableName,
                                data: {id: _rowId, langObj: langObj, fieldName: _fieldName},
                                successHandler: function(_callbackParams) {
                                    var response = _callbackParams.response;
                                    if (!response.success) alert(response.message);
                                    else
                                    {
                                        $modal.modal('hide');
                                        var $tr = widget.element.find('#'+widget.options.tableName+' tr[data-id='+_rowId+']');
                                        $tr.find('td[data-key='+_fieldName+']').text(response.data.name);
                                    }
                                }
                            });
                        })
                }

                $modalForm.empty();
                for(var lang in records)
                {
                    var val = records[lang];
                    $modalForm.append($('<div/>', {'class': 'form-group'})
                        .append($('<label/>', {'for': lang}).text(lang))
                        .append($('<input/>', {'class': 'form-control', 'type': 'text', 'name': lang, 'value': val})))
                }

                $modal.modal();
            }
        }
    });
    },


    /**
     *_showChildManager method
     *
     * @author Alexander Kudrya <alexkudrya91@gmail.com>
     * @copyright Copyright &copy; 2017
     * @created 2017.05.01
     * @updated 2017.05.29 Pre-destruction of widget if it already created
     */
    _showChildManager: function (_id){
        var widget = this;
        widget.element.find('#'+widget.options.tableName).hide();
        widget.element.find('#'+widget.options.tableName).closest('div').find('p:first-child').hide();

        $.getScript(
            '/application/modules/'+widget.options.moduleName+'/widgets/'+widget.options.childManager.name.toLowerCase()+'.js'
        ).fail(function(jqxhr, settings, exception) {
            alert('Failed to load child manager widget script.');
        }).done(function(script, textStatus) {
            if($('#'+widget.options.childManager.id).is(':xb-tourOperatorUsersManager'))
                $('#'+widget.options.childManager.id).tourOperatorUsersManager("destroy");
            eval('$.xb.'+widget.options.childManager.name+'({filters: [{key: "'+widget.options.childManager.relationItemName+'", value: _id, type: "hidden"}], '+widget.options.childManager.relationItemName+': _id, editAccess: '+widget.options.editAccess+'}, "#'+widget.options.childManager.id+'")');
        });
    },


    /**
     * _showRecordBlock method
     *
     * @author Alexander Kudrya <alexkudrya91@gmail.com>
     * @copyright Copyright &copy; 2017
     * @created 2017.05.16
     *
     * INFO:
     * use method _renderSelectedRecord
     * use method _renderSelectedRecordOptions
     * use method _showRelationBlock
     */
    _showRecordBlock: function (_id){
        var widget = this;
        widget._debug(widget.options.entityName+' '+_id+' opened');
        /**
         * Create the necessary blocks in the given order
         */
        if(widget.options.view.enable)
        {   /* @author Denis Kucher <dkucher88@gmail.com>
            * @updated 2017.06.22 added to options view.hideMainTable - hide or show main table after click button 'open'
            */
            if(widget.options.view.hideMainTable) widget.element.find('#main-table-'+widget.options.tableName).hide();
            var $recordBlock = $('body').find('#selectedRecord').show();
            var $recordForm;
            if ($recordBlock.length == 0)
            {
                $recordBlock = $('<div/>', {class: 'col-md-6 col-sm-6 col-xs-12', id: 'selectedRecord'});
                switch(widget.options.view.mode){
                    case 'form':
                        $('<form/>').appendTo($recordBlock);
                        $recordBlock.css({margin: '0 auto', maxWidth: '400px', height: '150px'});
                        break;
                    case 'table':
                        $('<table/>').appendTo($recordBlock);
                        $recordBlock.css({margin: '10px auto'});
                        break;
                    default:
                        $('<form/>').appendTo($recordBlock);
                        $recordBlock.css({margin: '0 auto', maxWidth: '400px', height: '150px'});
                };

                $('body').find('#content').append($recordBlock);
                /* @author Denis Kucher <dkucher88@gmail.com>
                * @copyright Copyright &copy; 2017
                * @updated 2017.06.22 added button 'Back' onclick back to main widget table
                */
                // if(widget.options.view.hideMainTable) {
                //     $recordBlock.append(
                //         $('<button/>',{'class': 'btn btn-primary btn-back-to-main', 'type': 'button', title:'Back to Main Table'}).css('margin','10px 0px').text('Back')
                //     );
                // }
            }
            else
            {
                $recordForm = $recordBlock.find('form');
                $recordForm.empty();
            }
            
            if(widget.options.view.options)
            {
                var $recordOptionsBlock = $('body').find('#selectedRecordOptions');
                var $recordOptionsForm;
                if (!$recordOptionsBlock.length)
                {
                    $recordOptionsBlock = $('<div/>', {class: 'col-md-6 col-sm-6 col-xs-12', id: 'selectedRecordOptions'}).css({margin: '0 auto', height: '150px'});
                    $('<h3/>').text('Options').appendTo($recordOptionsBlock);
                    $('<form/>').appendTo($recordOptionsBlock);
                    $('body').find('#content').append($recordOptionsBlock);
                }
                else
                {
                    $recordOptionsForm = $recordOptionsBlock.find('form');
                    $recordOptionsForm.empty();
                }
            }

            if(widget.options.view.relations.length)
            {
                for(var i in widget.options.view.relations)
                {
                    var relation = widget.options.view.relations[i];
                    var divId = relation.divId;
                    if(!$('div').is('#'+divId+'Block'))
                    {
                        widget.element.append(
                            $('<div/>', {id: divId+'Block'}).css({clear: 'both'})
                        );
                    }
                    else
                    {
                        $('body').find('#content>#'+divId+'Block').empty();
                    }
                }
            }
        }


        sendRequest({
            action: widget.options.moduleName+'.get'+widget.options.entityName,
            data: {id: _id},
            successHandler: function(_callbackParams) {
                var response = _callbackParams.response;
                if (!response.success) alert(response.message);
                else widget._renderSelectedRecord(response.data)
            }
        });
        if(widget.options.view.options)
        {
            sendRequest({
                action: widget.options.moduleName+'.get'+widget.options.entityName+'options',
                data: {id: _id},
                successHandler: function(_callbackParams) {
                    var response = _callbackParams.response;
                    if (!response.success) alert(response.message);
                    else widget._renderSelectedRecordOptions(response.data)
                }
            });
        }
        var relations = widget.options.view.relations;
        if(relations.length)
        {
            for(var i in relations)
            {
                var relation = relations[i];
                var filters = {key: relation.filter, value: _id};
                widget._showRelationBlock(relation.widgetName, filters, relation.divId)
            }
        }
    },


    /**
     * _renderSelectedRecord method
     *
     * @author Alexander Kudrya <alexkudrya91@gmail.com>
     * @copyright Copyright &copy; 2017
     * @created 2017.05.16
     *
     * INFO:
     * used by method _showRecordBlock
     */
    _renderSelectedRecord: function(_data){
        var widget = this;
        widget.options.view.recordId = _data.id;
        if(widget.options.view.enable)
        {
            var $recordBlock = $('body').find('#selectedRecord');
            var $recordContent;
            if ($recordBlock.length == 0)
            {
                $recordBlock = $('<div/>', {class: 'col-md-6 col-sm-6 col-xs-12', id: 'selectedRecord'}).css({margin: '0 auto'});
                $recordContent = $('<'+widget.options.view.mode+'/>').appendTo($recordBlock);
                $('body').find('#content').append($recordBlock);
            }
            else
            {
                $recordContent = $recordBlock.find(widget.options.view.mode);
                $recordContent.empty();
            }

            
            if (widget.options.view.mode == 'form') {};
            switch(widget.options.view.mode){
                case 'form':
                    widget._renderSelectedRecordAsForm(_data, $recordContent);
                    break;
                case 'table':
                    widget._renderSelectedRecordAsTable(_data, $recordContent);
                    break;
                default:
                    widget._renderSelectedRecordAsForm(_data, $recordContent);
            }
        }
    },


    /**
    * _renderSelectedRecordAsForm method
    *
    * @author Denis Kucher <dkucher88@gmail.com>
    * @created 2017.06.22
    *
    */

    _renderSelectedRecordAsForm:function (_data, _recordForm){
        var widget = this;
        var fields = widget.options.view.fields;
        for(var fieldId in fields)
        {
            var field = fields[fieldId];

            var $group = $('<div/>', {'class': 'form-group'});
            _recordForm.append($group);

            var $label;
            var $input;
            var value = eval('_data.'+field.key);
            switch(field.inputType){
                case 'text':
                case 'password':
                case 'email':
                case 'tel':
                    $label = $('<label/>', {'for': field.key}).text(field.name);
                    $input = $('<input/>', {'class': 'form-control', 'type': field.type, 'name': field.key, value: value}).attr('placeholder', field.name);
                    $group.append($label, $input);
                    break;

                // case 'select':
                //     if(typeof field.action !=="undefined")
                //     {
                //         var value = eval('_data.'+field.key);
                //         var $input = $('<select/>', {'name': field.key});
                //         $tbody.append($('<tr/>').append(
                //             $('<td/>').text(field.name),
                //             $('<td/>').append($('<td/>', {'data-key': field.key, title: 'Dropdown list'}).append($input))
                //         )); 
                //         if(!widget.options.editAccess) $input.attr('disabled', 'disabled');
                //         widget._insertOptionsToSelect($input, field, value);
                //     }
                //     break;
            }
        }
    }, 

    /**
    * _renderSelectedRecordAsTable method
    *
    * @author Denis Kucher <dkucher88@gmail.com>
    * @created 2017.06.22
    *
    */

    _renderSelectedRecordAsTable:function (_data, _recordForm){
        var widget = this;
        var fields = widget.options.view.fields;
        var dataId = _data.id;
        _recordForm.closest('#selectedRecord').attr('data-id',dataId);
        var $theadTr = $('<tr/>').append(
            $('<th/>').text('Свойство'),
            $('<th/>').text('Значение'),
        );
        
        _recordForm.append(
            $('<thead/>').append($theadTr),
            $tbody = $('<tbody/>')
        );
        
        //-----------------------------------
        for(var fieldId in fields)
        {
            var field = fields[fieldId];
            var key = field.name;
            
            // var value = eval('_data.'+field.key);
            
            switch(field.inputType){
                case 'text':
                case 'password':
                case 'email':
                case 'tel':
                    if(!widget.options.editAccess) field.editable = false;
                    var value = '';
                    // add by Denis Kucher -- if key as array (key:['name','phone','city'), display as string with ","
                    if (Array.isArray(field.key)) {
                        for(var i = 0; i < field.key.length; i++){
                            var fieldKey = field.key[i];
                            if(fieldKey.indexOf('.') == -1) {
                                value += _data[fieldKey]? _data[fieldKey]+', ' : '';    
                            }else{
                                var keys = fieldKey.split('.');
                                if ((_data[keys[0]][keys[1]] != '') && (_data[keys[0]][keys[1]] != null)) value += _data[keys[0]][keys[1]]+', ';
                            }
                        }
                    }else{
                        if(field.key.indexOf('.') == -1) {
                            value = _data[field.key] ? _data[field.key] : '';
                        }else{
                            var keys = field.key.split('.');
                            if ((_data[keys[0]][keys[1]] != '') && (_data[keys[0]][keys[1]] != null)) value = _data[keys[0]][keys[1]];
                        }
                    }    
                    if ((value.lastIndexOf(',') == value.length-2)&&(value.lastIndexOf(',') >0)) value = value.slice(0, -2);
                    
                    var title = '';
                    if(field.modalLang || field.editable)title = 'Click to edit';
                    if (field.number) value = Number(value).toFixed(Number(field.number));// added by Denis Kucher 2017.06.23
                    
                    $tbody.append($('<tr/>').append(
                        $('<td/>').text(field.name),
                        $td = $('<td/>', {'contenteditable': field.editable, 'data-key': field.key, 'modallang': field.modalLang, 'title': title}).css('text-align', field.textAlign ? field.textAlign : 'left').text(value)
                    ));    
                    if(field.renderAfterEdit) $td.attr('renderafteredit',true);
                    if(field.number) $td.attr('number',field.number);
                    break;
                case 'select':
                    if(typeof field.action !=="undefined")
                    {
                        var value = eval('_data.'+field.key);
                        var $input = $('<select/>', {'name': field.key});
                        $tbody.append($('<tr/>').append(
                            $('<td/>').text(field.name),
                            $('<td/>', {'data-key': field.key, title: 'Dropdown list'}).append($input)
                        )); 
                        if(!widget.options.editAccess) $input.attr('disabled', 'disabled');
                        widget._insertOptionsToSelect($input, field, value);
                    }
                    break;
                case 'checkbox':
                {
                    var value = eval('_data.'+field.key);
                    var $input = $('<input/>', {type: 'checkbox', 'name': field.key});
                    var title = '';
                    if(field.modalLang || field.editable) title = 'Check to '+ field.key;
                    if (!field.editable) $input.attr('disabled','disabled');
                    $tbody.append($('<tr/>').append(
                        $('<td/>').text(field.name),
                        $('<td/>', {'data-key': field.key, 'modallang': field.modalLang, 'title': title}).css('text-align', field.textAlign).append($input)
                    )); 
                    (value == '1')? $input.attr('checked','checked').val(value) : $input.val(value); 
                    
                }
            }
        }
        //---------------------------------------
    }, 
    
    /**
     * _renderSelectedRecordOptions method
     *
     * @author Alexander Kudrya <alexkudrya91@gmail.com>
     * @copyright Copyright &copy; 2017
     * @created 2017.05.17
     *
     * INFO:
     * used by method _showRecordBlock
     */
    _renderSelectedRecordOptions: function(_data){
        var widget = this;
        if(widget.options.view.enable && widget.options.view.options)
        {
            var $recordOptionsBlock = $('body').find('#selectedRecordOptions');
            var $recordOptionsForm;
            if ($recordOptionsBlock.length == 0)
            {
                $recordOptionsBlock = $('<div/>', {class: 'col-md-6 col-sm-6 col-xs-12', id: 'selectedRecordOptions'}).css({margin: '0 auto'});
                $recordOptionsForm = $('<form/>').appendTo($recordOptionsBlock);
                $('body').find('#content').append($recordOptionsBlock);
            }
            else
            {
                $recordOptionsForm = $recordOptionsBlock.find('form');
                $recordOptionsForm.empty();
            }

            $recordOptionsForm.append(
                $('<table/>').append(
                    $('<tbody/>')
                )
            );

            for (var optionId in _data)
            {
                var option = _data[optionId];
                var $tr = $('<tr/>', {'value-id': option.id}).append(
                    $('<th/>').text(option.name).css({textAlign: 'left'})
                );

                if(option.enumList === null)
                {
                    $('<td/>', {class: 'optionstr', contenteditable: 'true', id: option.key}).text(option.value).css({textAlign: 'left'}).appendTo($tr);
                }
                else
                {
                    var $td = $('<td/>', {class: 'optionselect', id: option.key}).appendTo($tr);
                    var $select = $('<select/>').appendTo($td);
                    for(var enumId in option.enumList)
                    {
                        var enumItem = option.enumList[enumId];
                        if(option.value == enumItem)
                        {
                            $('<option/>',{value: enumItem, selected: 'selected'}).text(enumItem).appendTo($select)
                        }
                        else
                        {
                            $('<option/>',{value: enumItem}).text(enumItem).appendTo($select)
                        }
                    }
                }
                $recordOptionsForm.find('table>tbody').append($tr);
            }
        }
    },


    /**
     * _setSelectedRecordValue method
     *
     * @author Alexander Kudrya <alexkudrya91@gmail.com>
     * @copyright Copyright &copy; 2017
     * @created 2017.05.16
     *
     * INFO:
     * use method _setRecordValue
     */
    _setSelectedRecordValue: function (_key){
        var widget = this;
        var $recordForm = $('body').find('#selectedRecord>form');
        var newValue = $recordForm.find('input[name='+_key+']').val();
        var action = widget.options.moduleName.toString().toLowerCase()+'.set'+widget.options.entityName.toString().toLowerCase();
        var recordId = widget.options.view.recordId;
        widget._setRecordValue(action, recordId, _key, newValue)
    },


    /**
     * _setSelectedRecordOption method
     *
     * @author Alexander Kudrya <alexkudrya91@gmail.com>
     * @copyright Copyright &copy; 2017
     * @created 2017.05.18
     *
     * INFO:
     * use method _setRecordValue
     */
    _setSelectedRecordOption: function (_valueId, _newValue){
        var widget = this;
        var action = widget.options.moduleName.toString().toLowerCase()+'.set'+widget.options.entityName.toString().toLowerCase()+'option';
        widget._setRecordValue(action, _valueId, 'value', _newValue)
    },


    /**
     * _setRecordValue method
     *
     * @author Alexander Kudrya <alexkudrya91@gmail.com>
     * @copyright Copyright &copy; 2017
     * @created 2017.05.17
     *
     * INFO:
     * used by method _setSelectedRecordValue
     */
    _setRecordValue: function (_action, _recordId, _fieldName, _value) {
        var widget = this;
        var $tr = widget.element.find('#'+widget.options.tableName+' tr[data-id='+_recordId+']');
        var $td = $tr.find('td[data-key='+_fieldName+']');
        if(widget.options.editAccess)
        {
            sendRequest({
                action: _action,
                data: {id: _recordId, value: _value, field: _fieldName},
                successHandler: function (_callbackParams) {
                    var response = _callbackParams.response;
                    if (!response.success) {
                        $td.text($td.data('value'));
                        alert(response.message);
                    } else {
                        $td.text(_value);
                    }
                }
            });
        }
        else
        {
            $td.text($td.data('value'));
            alert('You have not access to edit '+widget.options.tableName+'!');
        }

    },


    /**
     * _debug method
     *
     * @author Alexander Kudrya <alexkudrya91@gmail.com>
     * @copyright Copyright &copy; 2017
     * @created 2017.05.13
     */
    _debug: function (message, method) {
        var widget = this;

        if(widget.options.debug) {
            method = typeof method !== 'undefined' ? method : 'console';
            switch (method) {
                case 'console':
                    console.log(message);
                    break;
                case 'alert':
                    alert(message);
                    break;
            }
        }
    },


    /**
     * _showRelationBlock method
     *
     * @author Alexander Kudrya <alexkudrya91@gmail.com>
     * @copyright Copyright &copy; 2017
     * @created 2017.05.19
     *
     * INFO:
     * used by method _showRecordBlock
     */
    _showRelationBlock: function (_widgetName, _filter, _divId){
        var widget = this;
        $.getScript(
            '/application/modules/'+widget.options.moduleName+'/widgets/'+_widgetName.toLowerCase()+'.js'
        ).fail(function(jqxhr, settings, exception) {
            alert('Failed to load relation block widget script.');
        }).done(function(script, textStatus) {

            /**
            * Create <div/> for widget if it not created yet
            */
            if(!$('div').is('#'+_divId+'Block'))
            {
                widget.element.append(
                    $('<div/>', {id: _divId+'Block'})
                );
            }
            else
            {
                $('body').find('#content>#'+_divId).empty();
            }

            /**
             * Destroy widget if it already created
             */
            if($('#'+_divId).is(':xb-'+_widgetName))
            {
                eval('$("#"+_divId+"Block").'+_widgetName+'("destroy")');
            }

            /**
             * Create new widget
             */
            eval('$.xb.'+_widgetName+'({filters: [{key: "'+_filter.key+'", value: "'+_filter.value+'", type: "hidden"}], '+_filter.key+': "'+_filter.value+'"}, "#'+_divId+'Block")');
        });
    },


    _recordMoveUp: function (_id) {
        var widget = this;
        var $tr = widget.element.find('table#'+widget.options.tableName+'>tbody>tr[data-id='+_id+']');

        if($tr.prev().length != 0)
        {
            var toId = $tr.prev().attr('data-id');
            sendRequest({
                action: widget.options.moduleName+'.changeorder'+widget.options.entityName,
                data: {id1: _id, id2: toId},
                successHandler: function (_callbackParams) {
                    var response = _callbackParams.response;
                    if (!response.success) {
                        alert(response.message);
                    } else {
                        if(response.data) $tr.insertBefore($tr.prev());
                    }
                }
            });
        }
    },


    _recordMoveDown: function (_id) {
        var widget = this;
        var $tr = widget.element.find('table#'+widget.options.tableName+'>tbody>tr[data-id='+_id+']');

        if($tr.next().length != 0)
        {
            var toId = $tr.next().attr('data-id');
            sendRequest({
                action: widget.options.moduleName+'.changeorder'+widget.options.entityName,
                data: {id1: _id, id2: toId},
                successHandler: function (_callbackParams) {
                    var response = _callbackParams.response;
                    if (!response.success) {
                        alert(response.message);
                    } else {
                        if(response.data) $tr.insertAfter($tr.next());
                    }
                }
            });
        }
    },


    _recordInsertBefore: function (_id) {
        var widget = this;

        widget.options.beforeId = _id;
        widget.options.createInputs[widget.options.createInputs.length]={key: 'orderBefore', name: 'orderBefore', type: 'hidden', value: 'beforeId'};

        widget._renderCreateModalFormAk('before');
    },


    _recordInsertAfter: function (_id) {
        var widget = this;

        widget.options.afterId = _id;
        widget.options.createInputs[widget.options.createInputs.length]={key: 'orderAfter', name: 'orderAfter', type: 'hidden', value: 'afterId'};

        widget._renderCreateModalFormAk('after');
    },


    _openInsertRecordModal:function (_baseId, _position) {
        var widget = this;
        var $modal = $('#modal-insert-'+widget.options.entityName);

        var $form;
        if ($modal.length == 0)
        {
            $form = $('<form/>').attr('autocomplete', 'off');
            $modal = $('<div/>', {'class': 'modal fade in', 'tabindex': -1, 'role': 'dialog', 'id': 'modal-insert-'+widget.options.entityName}).append(
                $('<div/>', {'class': 'modal-dialog modal-md'}).append(
                    $('<div/>', {'class': 'modal-content'}).append(
                        $('<div/>', {'class': 'modal-header'}).append(
                            $('<button/>', {'class': 'close', 'type': 'button', 'data-dismiss': 'modal'}).text('×')).append(
                            $('<h4/>', {'class': 'title'}).css('text-align','center').text('Create new '+widget.options.entityName.charAt(0).toUpperCase() + widget.options.entityName.substr(1).toLowerCase()))).append(
                        $('<div/>', {'class': 'modal-body'}).append(
                            $form)).append(
                        $('<div/>', {'class': 'modal-footer'}).append(
                            $('<button/>', {'class': 'btn btn-primary', 'type': 'button'}).text('Create')

                        )
                    )
                )
            );

            var createInputs = widget.options.createInputs;
            var filters = widget.options.filters;
            for (var i in filters)
            {
                var filter = filters[i];
                if(filter.value !== undefined) createInputs.push({key: filter.key, name: filter.name, type: 'hidden', value: filter.value})
            }
            for (var i = 0; i < createInputs.length; ++i)
            {
                var $group = $('<div/>', {'class': 'form-group'});
                $form.append($group);

                var input = createInputs[i];
                var $label = $('<label/>', {'for': input.key}).text(input.name);
                var $input;
                var $help = $('<span/>', {id: input.key+'Help', class: 'help-block'});

                switch(input.type)
                {
                    case 'text':
                    case 'password':
                    case 'email':
                    case 'tel':

                        $input = $('<input/>', {'class': 'form-control', 'type': input.type, 'name': input.key}).attr({'placeholder': input.name, 'autocomplete': 'off'}).val(input.value);
                        if(input.maxLength) $input.attr('maxlength', input.maxLength);
                        if(input.uppercase) $input.css('text-transform', 'uppercase');
                        $group.append($label, $input, $help);

                        break;
                    case 'select':
                        if(typeof input.action !=="undefined")
                        {
                            $input = $('<select/>', {'name': input.key,'class': 'form-control'});
                            $input.append($('<option/>', {'value': 0}).attr('selected','selected').text('Select '+input.name));
                            $group.append($label, $input, $help);

                            widget._refreshSelectOptions($input, input);
                        }

                        break;
                    case 'date':
                        $input = $('<input/>', {'class': 'form-control', 'type': 'text', 'name': input.key, 'id': 'datepicker'+input.key}).attr('placeholder', input.name);

                        var $script = $('<script/>').text('' +
                            '$(function(){$( "#datepicker'+input.key+'" )' +
                            '.datepicker().datepicker( "option", "dateFormat", "yy-mm-dd")' +
                            '.datepicker( "option", "showAnim", "fold");});');
                        $group.append($script, $label, $input, $help);

                        break;
                    case 'hidden':
                        $input = $('<input/>', {'class': 'form-control', 'type': input.type, 'name': input.key}).val(input.value).insertAfter($group);
                        $group.remove();
                }
            }

            var displayedModal = $('.modal.fade.in:visible');
            if(displayedModal.length == 0) $modal.appendTo(widget.element);
            else $modal.insertAfter(displayedModal);

            $modal.on('shown.bs.modal', function (e) {
                var firstFormGroup = $form.find('.form-group:first-of-type');
                var firstInput = firstFormGroup.find('.form-control')[0];
                // console.log(firstInput);
                firstInput.focus();
            });
        }
        else
        {
            $modal.find('form')[0].reset();
        }


        if(_position == 'before' || _position == 'after' || _position == 'start') $modal.data({'baseId': _baseId, 'position': _position});
        if(_position === undefined || _position == 'end') $modal.data({baseId: null, position: 'end'});
        $modal.modal();
    },


    _insertRecord: function(_$modal, _data, _position, _baseId){
        var widget = this;

        switch(_position)
        {
            case 'before':
                sendRequest({
                    action: widget.options.moduleName+'.insert'+widget.options.entityName+'before',
                    data: {data: _data, beforeId: _baseId},
                    successHandler: function (_callbackParams) {
                        var response = _callbackParams.response;
                        if (!response.success) {
                            alert(response.message);
                        } else {
                            var id = response.data.id;
                            var record = response.data.record;

                            widget._appendRecord(id, record, _position, _baseId);
                            _$modal.modal('hide');
                            widget._renderIndexRecord();
                        }
                    }
                });

                break;

            case 'after':
                sendRequest({
                    action: widget.options.moduleName+'.insert'+widget.options.entityName+'after',
                    data: {data: _data, afterId: _baseId},
                    successHandler: function (_callbackParams) {
                        var response = _callbackParams.response;
                        if (!response.success) {
                            alert(response.message);
                        } else {
                            var id = response.data.id;
                            var record = response.data.record;
                            widget._appendRecord(id, record, _position, _baseId);
                            _$modal.modal('hide');
                            widget._renderIndexRecord();
                        }
                    }
                });

                break;

            case 'end':
            case 'start':
                sendRequest({
                    action: widget.options.moduleName+'.create'+widget.options.entityName,
                    data: {data: _data, afterId: _baseId},
                    successHandler: function (_callbackParams) {
                        var response = _callbackParams.response;
                        if (!response.success) {
                            alert(response.message);
                        } else {
                            // console.log(response.data.id);
                            var id = response.data.id;
                            var record = response.data.record;

                            widget._appendRecord(id, record, _position, _baseId);
                            _$modal.modal('hide');
                            widget._renderIndexRecord();
                        }
                    }
                });

        }
    },


    _getAsyncFooterItem: function(_$span, _footerItem){
        var widget = this;
        var _action = _footerItem.action;
        var action = '';
        if(_action.indexOf('.') + 1) action = _action;
        else action = widget.options.moduleName +'.'+ _action;

        var data = {};

        if(_footerItem.inputs !== undefined && !$.isEmptyObject(_footerItem.inputs))
        {
            var inputs = _footerItem.inputs;
            for(var key in inputs)
            {
                var input = inputs[key];
                eval('data.'+key+'=widget.options.'+input);
            }
        }

        sendRequest({
            action: action,
            data: data,
            successHandler: function (_callbackParams) {
                var response = _callbackParams.response;
                if (!response.success) {
                    alert(response.message);
                } else {
                    var data = response.data;
                    _$span.html(data);
                }
            }
        });
    }

});
