$.widget('xb.feedback', {

    options: {
        dummy: 'dummy'
    },

    _create: function () {
        var widget = this;
        this.element.on('click', '#feedback', function(e) { widget._openFeedbackForm(e) });
        $('body').on('click', '#submit', function(e) {
            e.preventDefault();
            widget._sendFeedback();
        });
        this._refresh();
    },

    _refresh: function () {
        var widget = this;
        widget.element.empty();
        $(widget.element).append(
            $('<a href="#" id="feedback">Задать вопрос</a>'),
            $('<div/>',{class: 'form-question'}).append(
                $('<div/>',{class:'form-overlay'}),
                $('<div/>',{class:'form-block'}).append(
                    $('<form/>',{class:'form-horizontal',role:'form'}).append(
                        $('<div/>',{class:'col-sm-10 col-sm-offset-2 form-mess'}),
                        $('<div/>',{class:'form-group'}).append(
                            $('<label/>',{class:'control-label col-sm-2', for:'name'}).text('*Имя:'),
                            $('<div/>',{class:'col-sm-9'}).append(
                                $('<input/>', {type: 'text', id: 'name', name: 'name', class:'form-control'}).attr('placeholder','Имя'),
                                $('<span/>',{class:'error-form'})
                            )
                        ),
                        $('<div/>',{class:'form-group'}).append(
                            $('<label/>',{class:'control-label col-sm-2', for:'phone'}).text('Телефон:'),
                            $('<div/>',{class:'col-sm-9'}).append(
                                $('<input/>', {type: 'tel', id: 'phone', name: 'phone', class:'form-control'}).attr('placeholder','Телефон'),
                                $('<span/>',{class:'error-form'})
                            )
                        ),$('<div/>',{class:'form-group'}).append(
                            $('<label/>',{class:'control-label col-sm-2', for:'email'}).text('E-Mail:'),
                            $('<div/>',{class:'col-sm-9'}).append(
                                $('<input/>', {type: 'text', id: 'email', name: 'email', class:'form-control'}).attr('placeholder','your-mail@mail.com'),
                                $('<span/>',{class:'error-form'})
                            )
                        ),
                        $('<div/>',{class:'form-group'}).append(
                            $('<label/>',{class:'control-label col-sm-2', for:'question'}).text('*Вопрос:'),
                            $('<div/>',{class:'col-sm-9'}).append(
                                $('<textarea/>', {id: 'question', name: 'question', class:'form-control', cols: 5}).css('height',114),
                                $('<span/>',{class:'error-form'})
                            )
                        ),
                        $('<div/>',{class:'form-group'}).append(
                            $('<div/>',{class:'col-sm-offset-2 col-sm-10'}).append(
                                $('<button/>', {type: 'submit', id: 'submit', class:'btn btn-default'}).text('Отправить')
                            )
                        )
                    ),
                    $('<span/>',{class:'close-form'})
                ),
                $('<div/>',{class:'before'})
            ),
//**************************
            $('<div/>',{id:'myModal',class:'modal fade',role:'dialog'}).append(
                $('<div/>',{class:'modal-dialog'}).append(
                    $('<div/>',{class:'modal-content'}).append(
                        $('<div/>',{class:'modal-body'}).append(
                            $('<p/>').text('Спасибо, ваше сообщение отправлено')
                        )
                    )
                )
            )
//******************************
        )
    },


    _openFeedbackForm:function(e) {
        e.preventDefault();
        var $formQuestion = $('.form-question'),
            $form = $formQuestion.find('form'),
            $formOverlayClose = $('.form-overlay,.close-form');

        $form[0].reset();
        $formQuestion.fadeIn(500).find('.err').removeClass('err').html('').end()
            .find('.form-mess').text('');

        $('body').one('keydown',function(e) {
            if(e.which == 27){
                $formQuestion.fadeOut(500);
            }
        });

        $formOverlayClose.one('click',function(e) {
            $formQuestion.fadeOut(500);
        })
    },


    _sendFeedback:function() {
        var data = $('.form-horizontal').serializeObject(),
            $formQuestion = $('.form-question'),
            $myModal = $('#myModal'),
            $errorForm = $('.error-form'),
            $formMess = $('.form-mess');
        sendRequest({
            action: 'basic.createfeedback',
            data: data,
            successHandler: function (_callbackParams) {
                var response = _callbackParams.response;
                $formQuestion.find('.err').removeClass('err').html('');
                if (!response.success){
					//console.log(JSON.parse(response.message));
                    $formMess.css('color','red').html('Пожалуйста, проверьте корректность заполнения формы.');
                    var errors = JSON.parse(response.message);
                    for(var err in errors) {
						console.log(errors[err]);
                        $formQuestion.find('#' + err).next().show().addClass('err').text(errors[err]);
                    }
                }
                else{
                    $myModal.modal('show');
                    $errorForm.removeClass('err');
                    $formMess.removeClass('err');
                    setTimeout(function() {
                        $formQuestion.fadeOut(500);
                        $myModal.modal('hide');
                        $errorForm.hide();
                    },2000)
                }
            }
        });
    }
    
});
