$.widget('xbspa.abstract', {

    options: {
        dummy: 'dummy',
        debug: false,
        appName: 'Abstract',
        //! [2017.05.30] [Alexander Babayev]: Слишком абстрактное название, семантика не ясна
        myData: {},
        user: null
    },
    

    _create: function () {
        var widget = this;


        $('body').on('click', '#modal-login .btn-primary', function(_e) {
            $('body').find('#form-login').trigger('submit');
        })
        
        $('body').on('submit', '#form-login', function(_e) {
            _e.preventDefault();
            widget._login($(this).serializeObject());
        });
        
        
        this.element.on('click', '#btn-login', function() { widget._openLoginModal() });
        this.element.on('click', '#btn-logout', function() { widget._logout() });
        this.element.on('click', '#profile', function() { widget._profileShowHide() });
        this.element.on('click', '#closeprofile', function() { widget._profileShowHide() });
        this.element.on('click', '#btn-pass', function() { widget._openChangePassword() });
        this.element.on('click', '#btn-myprofile', function() { widget._openMyProfile() });
        this.element.on('click', '#btn-mycompany', function() { widget._showGlodalModalWidget('my-company', {moduleName: 'main', widgetName: 'myCompanyManager', request: '{filters: [{key: "companyId", value: "'+widget.options.user.companyId+'", type: "hidden"}], companyId: "'+widget.options.user.companyId+'"}', appName: "My Company"}) });
        this._refresh();
    },


    _refresh: function () {
        var widget = this;
        widget.element.empty();
        sendRequest({
            action: 'basic.getappuser',
            data: {},
            successHandler: function(_callbackParams) {
                var response = _callbackParams.response;
                if (!response.success) alert(response.message);
                else
                {
                    widget.options.user = response.data.user;
                    widget.options.myData = response.data;
                    widget._render(response.data);
                }
            }
        });
    },


    /**
     * _render method
     *
     * @author Alexander Kudrya <alexkudrya91@gmail.com>
     * @copyright Copyright &copy; 2017
     * @updated 2017.05.13 added user access checking
     */
    _render: function(_data) {
        var widget = this;
        $('title').text(widget.options.appName);
        widget._renderNavbar(_data);

        if (_data.user == null)
        {
            $('<div/>', {class: 'alert alert-danger', role: 'alert'}).append($('<h1/>').text('You are not authorized to run this application!')).appendTo(widget.element);
            widget._openLoginModal();
        }
        else
        {
            var appName = widget.options.appName;
            sendRequest({
                action: 'basic.checkaccesstoapplication',
                data: {roleId: _data.user.userRoleId, appName: appName, head: _data.user.head},
                successHandler: function(_callbackParams) {
                    var response = _callbackParams.response;
                    if (!response.success) alert(response.message);
                    else var access = response.data;
                    if(access.access) {
                        _data.editAccess = access.edit;
                        //! [2017.05.30] [Alexander Babayev]: Do not leave debug messages
                        console.log('Access to the application is allowed');
                        widget._renderContent(_data);
                    }
                    else {
                        $('<div/>', {class: 'alert alert-danger', role: 'alert'}).append($('<h1/>').text('You do not have access to this application!')).appendTo(widget.element);
                        console.log('Denied access to the application');
                    }
                }
            });
        }
    },


    /**
     * _renderNavbar method
     *
     * @author Alexander Kudrya <alexkudrya91@gmail.com>
     * @copyright Copyright &copy; 2017
     * @updated 2017.05.05 - added profile widget
     */
    _renderNavbar: function(_data) {
        var widget = this;
        var $navbarContent = $('<div/>', {class: 'container-fluid'}).appendTo($('<nav/>', {class: 'navbar navbar-default'}).appendTo(widget.element));
        $navbarContent.append($('<a/>', {class: 'navbar-brand pull-left', href: ''}).css({padding: '5px 0', marginLeft: 0}).append($('<img/>', {class: 'img-responsive', src: '/application/modules/main/images/logo.png'}).css({width: 36, height: 36})));
        $navbarContent.append($('<a/>', {type: 'button', class: 'btn btn-primary navbar-btn pull-left btn-sm', href: '/dashboard.htm'}).text('Dashboard').css('margin-left', '15px'));
        if (_data.user) {
            var avatar='';
            if(_data.user.image == null)
            {
                avatar ='/application/modules/basic/images/defaultavatar.png';
            }
            else
            {
                avatar = '../uploads/users/'+_data.user.image;
            }
            $('<div/>', {id: 'profile', class: 'pull-right', title: 'My Profile'}).css({height: 40, width: 40, margin: 5, cursor: 'pointer', display: 'block', borderRadius: '50%', 'background-image': 'url("'+avatar+'")', 'background-size': 'cover', 'background-position': 'center'}).appendTo($navbarContent);
            //! [2017.05.30] [Alexander Babayev]: Лучше использовать предопределенные константы вместо сырых значений для ролей
            if(_data.user.userRoleId == '2' && _data.user.head == '1') $('<button/>', {id: 'btn-mycompany', type: 'button', class: 'btn btn-primary navbar-btn pull-right btn-sm'}).text('My company').css('margin-right', '15px').appendTo($navbarContent);

            var $profileWidget = $('<div/>', {id: 'profilewidget'}).appendTo(widget.element);
            $profileWidget.css({
                width: 400,
                height: 190,
                position: 'absolute',
                zIndex: '3',
                right: '16px',
                background: '#f8f8f8',
                borderRadius: '4px',
                border: '1px solid #b7b7b7',
                display: 'none',
                boxShadow: '0 0 10px #666',
                top: '58px'
            });

            var $profileInBox = $('<div/>').appendTo($profileWidget);
            $profileInBox.css({
                width: 400,
                height: 190,
                position: 'relative',
            });

            $('<div/>').css({
                position: 'absolute',
                right: '33px',
                top: '-21px',
                width: '0',
                height: '0',
                border: '10px solid transparent',
                borderBottomColor: '#b7b7b7'
            }).appendTo($profileInBox);

            $('<div/>').css({
                position: 'absolute',
                right: '33px',
                top: '-20px',
                width: '0',
                height: '0',
                border: '10px solid transparent',
                borderBottomColor: '#f8f8f8'
            }).appendTo($profileInBox);

            $('<div/>', {id: 'profileAvatar'}).css({
                backgroundImage: 'url("'+avatar+'")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                borderRadius: '50%',
                position: 'absolute',
                left: '20px',
                top: '20px',
                width: '95px',
                height: '95px'
            }).appendTo($profileInBox);

            $('<p/>', {id: 'userName'}).css({
                position: 'absolute',
                left: '135px',
                top: '20px'
            }).append($('<strong/>').text(_data.user.name)).appendTo($profileInBox);

            $('<p/>', {id: 'userLogin'}).css({
                position: 'absolute',
                left: '135px',
                top: '40px',
                color: '#8e8e8e'
            }).text(_data.user.username).appendTo($profileInBox);

            //! [2017.05.30] [Alexander Babayev]: Use map instead of switch
            var role = '';
            switch(_data.user.userRoleId)
            {
                case '1':
                    role = 'Administrator';
                    break;
                case '2':
                    role = 'Tour Operator';
                    break;
                case '3':
                    role = 'Sales Manager';
                    break;
                case '4':
                    role = 'Operating Officer';
                    break;
            }

            $('<p/>').css({
                position: 'absolute',
                left: '135px',
                top: '60px',
                color: '#8e8e8e'
            }).text(role).appendTo($profileInBox);

            $('<button/>', {id: 'btn-logout', type: 'button', class: 'btn btn-primary navbar-btn'}).css({
                position: 'absolute',
                right: '20px',
                bottom: '10px',
            }).text('Logout').appendTo($profileInBox);

            $('<button/>', {id: 'btn-pass', type: 'button', class: 'btn btn-primary navbar-btn'}).css({
                position: 'absolute',
                right: '120px',
                bottom: '10px',
            }).text('Change Password').appendTo($profileInBox);

            $('<button/>', {id: 'btn-myprofile', type: 'button', class: 'btn btn-primary navbar-btn'}).css({
                position: 'absolute',
                right: '290px',
                bottom: '10px',
            }).text('My profile').appendTo($profileInBox);

            $('<button/>', {class: 'close', type: 'button', id: 'closeprofile'}).text('Г—').css({
                position: 'absolute',
                right: '17px',
                top: '10px',
            }).appendTo($profileInBox);
        }
        else
            $('<button/>', {id: 'btn-login', type: 'button', class: 'btn btn-primary navbar-btn pull-right'}).text('Login').appendTo($navbarContent);
},
    
    
    _renderContent: function(_data) {
        var widget = this;
        $('<div/>', {id: 'content'}).appendTo(widget.element);
    },
    
    
    _openLoginModal: function() {
        var widget = this;
        var $modal = $('body').find('#modal-login');
        if ($modal.length == 0) {
            $modal = $('<div/>', {id: 'modal-login', class: 'modal fade', role: 'dialog', tabindex: '-1'}).append(
                $('<div/>', {class: 'modal-dialog modal-sm'}).append(
                    $('<div/>', {class: 'modal-content'}).append(
                        $('<div/>', {class: 'modal-header'}).append(
                            $('<button/>', {type: 'button', class: 'close', 'data-dismiss': 'modal'}).html('&times;'),
                            $('<h4/>', {class: 'title'})
                        ),
                        $('<div/>', {class: 'modal-body'}).append(
                            $('<form/>', {id: 'form-login'}).append(
                                $('<input/>', {type: 'submit', name: 'submit'}).css('display','none'),
                                $('<div/>', {class: 'form-group'}).append($('<input/>', {class: 'form-control', type: 'text', name: 'username'}).attr('placeholder','username')),
                                $('<div/>', {class: 'form-group'}).append($('<input/>', {class: 'form-control', type: 'password', name: 'password'}).attr('placeholder','password'))
                            )
                        ),
                        $('<div/>', {class: 'modal-footer'}).append(
                            $('<button/>', {type: 'button', class: 'btn btn-primary'}).text('Login')
                        )
                    )
                )
            );
            $modal.on('show.bs.modal', function(_event) {
                $modal.find('.modal-header>.title').css('color','inherit').text('Login to Your Account');
            });
            $modal.on('shown.bs.modal', function(_event) {
                $modal.find('#form-login input[name=username]').focus()
            });
            $modal.on('hide.bs.modal', function(_event) {
                if ($modal.find('.modal-footer>.btn-primary:disabled').length) _event.preventDefault();
            });
            $modal.on('hidden.bs.modal', function(_event) {
                clearForm($modal.find('#form-login'));
            });
        }
        $modal.modal();
    },
    
    
    _renderWorkarea: function() {
        var widget = this;
        $('<div/>', {class: 'jumbotron'}).append($('<h1/>').text('Hello! I am '+widget.options.appName+' SPA!')).appendTo(widget.element);
    },
    
    
    _login: function(_data) {
        var widget = this;
        var $modal = $('body').find('#modal-login');
        $modal.find('.modal-header>.title').css('color','inherit').text('Logging in...');
        $modal.find('.modal-footer>.btn-primary').prop('disabled',true);
        $modal.find('#form-login :input').prop('disabled',true);
        sendRequest({
            ajaxGlobal: false,
            action: 'basic.login',
            data: _data,
            successHandler: function(_callbackParams) {
                var response = _callbackParams.response;
                $modal.find('.modal-footer>.btn-primary').prop('disabled',false);
                $modal.find('#form-login :input').prop('disabled',false);
                if (!response.success)
                    $modal.find('.modal-header>.title').css('color','red').text(response.message);
                else {
                    $modal.modal('hide');
                    widget._refresh();
                }
            }
        });
    },
    

    _logout: function() {
        var widget = this;
        sendRequest({
            action: 'basic.logout',
            data: {},
            successHandler: function(_callbackParams) {
                var response = _callbackParams.response;
                if (!response.success) alert(response.message);
                else widget._refresh();
            }
        });
    },


    //! [2017.05.30] [Alexander Babayev]: Rename to: '_toggleProfileBox'
    _profileShowHide: function () {
        var widget = this;
        var profile = widget.element.find('#profilewidget');
        //! [2017.05.30] [Alexander Babayev]: There is a jQuery toggle() function exists for this purpose
        if(profile.css('display') != 'none')
        {
            profile.css('display', 'none');
        }
        else
        {
            profile.css('display', 'block');
        }
    },


    /**
     * _openChangePassword method
     *
     * @author Alexander Kudrya <alexkudrya91@gmail.com>
     * @copyright Copyright &copy; 2017
     * @updated 2017.05.05
     */
    _openChangePassword: function () {
        var widget = this;
        //! [2017.05.30] [Alexander Babayev]: All jQuery variables should starts with $ (modalPass -> $modalPass)
        var modalPass = $('body').find('#modal-changepassword');
        if(modalPass.length == 0)
        {
            modalPass = $('<div/>', {id: 'modal-changepassword', class: 'modal fade', role: 'dialog'}).append(
                $('<div/>', {class: 'modal-dialog'}).append(
                    $('<div/>', {class: 'modal-content'}).append(
                        $('<div/>', {class: 'modal-header'}).append($('<h4/>').text('Change Password')),
                        $('<div/>', {class: 'modal-body'}).append(
                            $('<form/>', {id: 'form-updatepassword'}).append(
                                $('<div/>', {class: 'form-group'}).append(
                                    $('<label/>', {for: 'a-currentPassword'}).text('Current Password'),
                                    $('<input/>', {id: 'a-currentPassword', class: 'form-control', type: 'password', name: 'currentPassword'}),
                                    $('<span/>', {id: 'a-currentPasswordHelp', class: 'help-block'})),
                                $('<div/>', {class: 'form-group'}).append(
                                    $('<label/>', {for: 'a-newPassword'}).text('New Password'),
                                    $('<input/>', {id: 'a-newPassword', class: 'form-control', type: 'password', name: 'newPassword'}),
                                    $('<span/>', {id: 'a-newPasswordHelp', class: 'help-block'})),
                                $('<div/>', {class: 'form-group'}).append(
                                    $('<label/>', {for: 'a-retypeNewPassword'}).text('Retype New Password'),
                                    $('<input/>', {id: 'a-retypeNewPassword', class: 'form-control', type: 'password', name: 'retypeNewPassword'}),
                                    $('<span/>', {id: 'a-retypeNewPasswordHelp', class: 'help-block'})))),
                        $('<div/>', {class: 'modal-footer'}).append(
                            $('<button/>', {type: 'button', class: 'btn btn-primary'}).text('Update')
                                .bind('click', widget._changePassword),
                            $('<button/>', {type: 'button', class: 'btn btn-default', 'data-dismiss': 'modal'}).text('Cancel')))))
        }
        else
        {
            modalPass.find('form')[0].reset();
            modalPass.find('form .form-group').removeClass('has-error');
            modalPass.find('form .form-group span').empty();
        }

        modalPass.modal();
    },


    /**
     * _changePassword method
     *
     * @author Alexander Kudrya <alexkudrya91@gmail.com>
     * @copyright Copyright &copy; 2017
     * @updated 2017.05.05
     */
    //! [2017.05.30] [Alexander Babayev]: Концепт: методы не должны быть ивент-хэндлерами
    //! [2017.05.30] [Alexander Babayev]: Порефакторить.
    _changePassword: function(_e){
        _e.preventDefault();
        var widget = this;
        var modalPass = $('body').find('#modal-changepassword');
        if(modalPass.length == 0) return;
        var currentPassword = modalPass.find('#a-currentPassword').val();
        var newPassword = modalPass.find('#a-newPassword').val();
        var retypeNewPassword = modalPass.find('#a-retypeNewPassword').val();

        var valid = true;

        if(currentPassword.length == 0){
            modalPass.find('#a-currentPasswordHelp').text('Current password cannot be empty').closest('.form-group').addClass('has-error').find('#a-currentPassword')
                .bind('keypress', function () {
                    $('#a-currentPassword').closest('.form-group').removeClass('has-error').find('span').empty();
                });
            valid = false;
        }
        var passRegular = newPassword.search(/^[A-Za-z0-9]{6,16}$/);
        if(newPassword.length == 0){
            modalPass.find('#a-newPasswordHelp').text('New password cannot be empty').closest('.form-group').addClass('has-error').find('#a-newPassword')
                .bind('keypress', function () {
                    $('#a-newPassword').closest('.form-group').removeClass('has-error').find('span').empty();
                });
            valid = false;
        }
        else
        {
            if(newPassword.length < 6){
                modalPass.find('#a-newPasswordHelp').text('Password can not be less than 6 characters').closest('.form-group').addClass('has-error').find('#a-newPassword')
                    .bind('keypress', function () {
                        $('#a-newPassword').closest('.form-group').removeClass('has-error').find('span').empty();
                    });
                valid = false;
            }
            else
            {
                if(newPassword.length > 16){
                    modalPass.find('#a-newPasswordHelp').text('Password can not be longer than 16 characters').closest('.form-group').addClass('has-error').find('#a-newPassword')
                        .bind('keypress', function () {
                            $('#a-newPassword').closest('.form-group').removeClass('has-error').find('span').empty();
                        });
                    valid = false;
                }
                else
                {
                    if (passRegular < 0){
                        modalPass.find('#a-newPasswordHelp').text('The password can consist only of Latin letters and numbers').closest('.form-group').addClass('has-error').find('#a-newPassword')
                            .bind('keypress', function () {
                                $('#a-newPassword').closest('.form-group').removeClass('has-error').find('span').empty();
                            });
                        valid = false;
                    }
                    else
                    {
                        if(newPassword == currentPassword){
                            modalPass.find('#a-newPasswordHelp').text('New password must be different from the old one').closest('.form-group').addClass('has-error').find('#a-newPassword')
                                .bind('keypress', function () {
                                    $('#a-newPassword').closest('.form-group').removeClass('has-error').find('span').empty();
                                });
                            valid = false;
                        }
                    }
                }
            }
        }

        if(retypeNewPassword.length == 0){
            modalPass.find('#a-retypeNewPasswordHelp').text('Retype new password cannot be empty').closest('.form-group').addClass('has-error').find('#a-retypeNewPassword')
                .bind('keypress', function () {
                    $('#a-retypeNewPassword').closest('.form-group').removeClass('has-error').find('span').empty();
                });
            valid = false;
        }
        else
        {
            if(newPassword != retypeNewPassword){
                modalPass.find('#a-retypeNewPasswordHelp').text('Passwords does not match').closest('.form-group').addClass('has-error').find('#a-retypeNewPassword')
                    .bind('keypress', function () {
                        $('#a-retypeNewPassword').closest('.form-group').removeClass('has-error').find('span').empty();
                    });
                valid = false;
            }
        }

        if(valid)
        {
            _data = {currentPassword: currentPassword, newPassword: newPassword, retypeNewPassword: retypeNewPassword};

            sendRequest({
                action: 'basic.updatemypassword',
                data: _data,
                successHandler: function (_callbackParams) {
                    var response = _callbackParams.response;
                    if (!response.success) {
                        if(response.message == 'Wrong current password.')
                        {
                            modalPass.find('#a-currentPasswordHelp').text('Wrong current password').closest('.form-group').addClass('has-error').find('#a-currentPassword').bind('keypress', function () {
                                $('#a-currentPassword').closest('.form-group').removeClass('has-error').find('span').empty();
                                valid = false;
                            });
                        }
                        else
                        {
                            alert(response.message);
                        }
                    } else {
                        var $modal = $('body').find('#modal-changepassword');
                        $modal.modal('hide');
                        // alert('Your password has been changed.');

                        var modalSuccess = $('body').find('#modal-success');

                        if(modalSuccess.length == 0) modalSuccess = $('<div/>', {id: 'modal-success', class: 'modal fade', role: 'dialog'});

                        modalSuccess.empty().append(
                            $('<div/>', {class: 'modal-dialog modal-sm'}).append(
                                $('<div/>', {class: 'modal-content'}).append(
                                    $('<div/>', {class: 'modal-header'}).append($('<h4/>').text('Password changed successfully')),
                                    $('<div/>', {class: 'modal-footer'}).css('text-align','center').append(
                                        $('<button/>', {type: 'button', class: 'btn btn-success'}).text('Close')
                                            .bind('click', function () {
                                                $('#modal-success').modal('hide');
                                            })
                                        ))));
                        modalSuccess.modal();
                        function successModalHandler(_e) {
                            var len = $('#modal-success').length;
                            var display;
                            if(len != 0) display = $('#modal-success').css('display');
                            if (len != 0 && display == 'block') {
                                var code = _e.keyCode || _e.which;
                                if (code == 13) {
                                    $('#modal-success').modal('hide');
                                    $('body').off('keyup', successModalHandler);
                                }
                            }
                        }
                        $('body').on('keyup', successModalHandler);

                        $('#modal-success').on('hide.bs.modal', function (e) {
                            $('body').off('keyup', successModalHandler);
                        })
                    }
                }
            });
        }
    },


    /**
     * _openMyProfile method
     *
     * @author Alexander Kudrya <alexkudrya91@gmail.com>
     * @copyright Copyright &copy; 2017
     * @created 2017.05.05
     * @updated 2017.05.11
     */
    //! [2017.05.30] [Alexander Babayev]: Порефакторить.
    _openMyProfile: function () {
        var widget = this;
        var myData = widget.options.myData;
        var $modalMyProfile = $('body').find('#modal-myprofile');
        if($modalMyProfile.length == 0){
            $modalMyProfile = $('<div/>', {id: 'modal-myprofile', class: 'modal fade', role: 'dialog'});
        }
        if(!$modalMyProfile.firstChild)
        {
            var avatar='';
            if(myData.user.image == null)
            {
                avatar ='/application/modules/basic/images/defaultavatar.png';
            }
            else
            {
                avatar = '../uploads/users/'+myData.user.image;
            }
            $modalMyProfile.append(
                $('<div/>', {class: 'modal-dialog'}).append(
                    $('<div/>', {class: 'modal-content'}).append(
                        $('<div/>', {class: 'modal-header'}).append($('<h4/>').text('My profile')),
                        $('<div/>', {class: 'modal-body'}).append(
                            $('<form/>', {id: 'form-myprofile'}).append(
                                $('<div/>', {class: 'col-xs-12'}).append(
                                    $('<div/>', {class: 'col-sm-4 col-xs-6 text-right'}).append(
                                        $('<div/>', {id: 'profileEditAvatar'}).css({width: '120px', height: '120px', margin: '0 auto 15px auto', borderRadius: '50%', 'background-image': 'url("'+avatar+'")', 'background-size': 'cover', 'background-position': 'center'})
                                    ),
                                    $('<div/>', {class: 'col-sm-8 col-xs-6 text-right'}).append(

                                        $('<div/>', {id: 'fine-uploader-avatar'})
                                    )),
                                $('<div/>', {class: 'col-xs-12'}).append(
                                    $('<div/>', {class: 'col-xs-3 text-right'}).append(
                                        $('<p/>').css('margin-top', '6px').append(
                                            $('<strong/>').text('Login:'))),
                                    $('<div/>', {class: 'col-xs-9'}).append(
                                        $('<div/>', {class: 'form-group'}).append(
                                            $('<input/>', {type: 'text', value: myData.user.username, class: 'form-control', name: 'username'})))),
                                $('<div/>', {class: 'col-xs-12'}).append(
                                    $('<div/>', {class: 'col-xs-3 text-right'}).append(
                                        $('<p/>').css('margin-top', '6px').append(
                                                $('<strong/>').text('My name:'))),
                                    $('<div/>', {class: 'col-xs-9'}).append(
                                        $('<div/>', {class: 'form-group'}).append(
                                            $('<input/>', {type: 'text', value: myData.user.name, class: 'form-control', name: 'name'})))),
                                $('<div/>').css('clear', 'both')

                            )),
                        $('<div/>', {class: 'modal-footer'}).append(
                            $('<button/>', {type: 'button', class: 'btn btn-primary', id: 'trigger-upload'}).text('Update')
                                .bind('click', function () {
                                    var name = $modalMyProfile.find('input[name=name]').val();
                                    var username = $modalMyProfile.find('input[name=username]').val();
                                    if($modalMyProfile.find('input[name=username]').val() == $modalMyProfile.find('input[name=username]').attr('value')) username = '';
                                    var userId = widget.options.myData.user.id;
                                    sendRequest({
                                        action: 'basic.setuserprofile',
                                        data: {id: userId, name: name, username: username},
                                        successHandler: function(_callbackParams) {
                                            if(username == '') username = $modalMyProfile.find('input[name=username]').attr('value');
                                            var response = _callbackParams.response;
                                            if (!response.success) {
                                                alert(response.message);
                                                var oldName = $modalMyProfile.find('input[name=name]').attr('value');
                                                var oldLogin = $modalMyProfile.find('input[name=username]').attr('value');
                                                $modalMyProfile.find('input[name=name]').val(oldName);
                                                $modalMyProfile.find('input[name=username]').val(oldLogin);
                                            }
                                            else
                                            {
                                                $('body').find('#userName>strong').text(name);
                                                $('body').find('#userLogin').text(username);
                                                myData.user.username = username;
                                                myData.user.name = name;
                                                $modalMyProfile.modal('hide');
                                            }
                                        }
                                    });
                                }),
                            $('<button/>', {type: 'button', class: 'btn btn-default', 'data-dismiss': 'modal'}).text('Cancel').bind(
                                'click', function (){
                                // $modalMyProfile.find('form')[0].reset();
                                $modalMyProfile.modal('hide');
                            })
                        )
                    )
                )
            )
        }
        else
        {
            $modalMyProfile.empty();
            widget._openMyProfile();
        }

        $modalMyProfile.on('hidden.bs.modal', function (e) {
            $modalMyProfile.empty();
        });

        $modalMyProfile.find('#fine-uploader-avatar').fineUploader({
            request: {
                endpoint: '/async/basic.fileupload'
            },
            thumbnails: {
                placeholders: {
                    waitingPath: '/source/placeholders/waiting-generic.png',
                    notAvailablePath: '/source/placeholders/not_available-generic.png'
                }
            },
            autoUpload: true,
            callbacks: {
                onComplete: function(id, name, response) {
                    var userId = widget.options.myData.user.id;
                    var uuId = response.data.uuid;
                    sendRequest({
                        action: 'basic.putusersimage',
                        data: {userId: userId, filename: name, uuId: uuId},
                        successHandler: function(_callbackParams) {
                            var response = _callbackParams.response;
                            if (!response.success) alert(response.message);
                            else
                            {
                                $('body').find('#profile').css({backgroundImage: 'url("../uploads/users/'+uuId+'/'+name+'")'});
                                $('#profilewidget').find('#profileAvatar').css({backgroundImage: 'url("../uploads/users/'+uuId+'/'+name+'")'});
                                $modalMyProfile.find('#profileEditAvatar').css({backgroundImage: 'url("../uploads/users/'+uuId+'/'+name+'")'});
                                myData.user.image = uuId+'/'+name;
                                $modalMyProfile.find('#fine-uploader').fineUploader('clearStoredFiles');
                            }
                        }
                    });
                }
            }
        });

        $modalMyProfile.find('#trigger-upload').click(function() {
            if($modalMyProfile.find('#fine-uploader').fineUploader('getUploads').length == 1){
                $modalMyProfile.find('#fine-uploader').fineUploader('uploadStoredFiles')
            }
        });

        $modalMyProfile.modal();
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
                    console.trace(message);
                    break;
                case 'alert':
                    alert(message);
                    break;
            }
        }
    },


    //! [2017.05.30] [Alexander Babayev]: Над названием надо подумать...
    _showGlodalModalWidget: function (_divId, _data){
        var widget = this;
        var $modal = $('body').find('#'+_divId+'modal');

        if ($modal.length == 0)
        {
            $modal = $('<div/>', {'class': 'modal fade in', 'tabindex': -1, 'role': 'dialog', id: _divId+'modal'}).css('display', 'block').append(
                $('<div/>', {'class': 'modal-dialog modal-lg'}).append(
                    $('<div/>', {'class': 'modal-content'}).append(
                        $('<div/>', {'class': 'modal-header'}).append(
                            $('<button/>', {'class': 'close closeModalWidget', 'type': 'button', 'data-dismiss': 'modal'}).text('Г—'),
                            $('<h4/>', {class: 'title'}).css({textAlign: 'center'}).text(_data.appName)),
                        $('<div/>', {'class': 'modal-body'}).append($('<div/>', {id: _divId})),
                        $('<div/>', {'class': 'modal-footer'}).append(
                            $('<button/>', {'id': _divId+'modalcancel', 'class': 'btn btn-default', 'type': 'button', 'data-dismiss': 'modal'}).text('Cancel')
                        )
                    )
                )
            );

            $modal.on('shown.bs.modal', function (e) {
                $.getScript(
                    '/application/modules/basic/widgets/abstractmanager.js'
                ).fail(function(jqxhr, settings, exception) {
                    alert('Failed to load abstract manager widget script.');
                }).done(function(script, textStatus) {
                    $.getScript(
                        '/application/modules/'+_data.moduleName+'/widgets/'+_data.widgetName.toLowerCase()+'.js'
                    ).fail(function(jqxhr, settings, exception) {
                        alert('Failed to load '+_data.widgetName+' widget script.');
                    }).done(function(script, textStatus) {
                        var test = $('#'+_divId);
                       eval('$.xb.'+_data.widgetName+'('+_data.request+', "#'+_divId+'")');
                    });
                });
                $modal.off('shown.bs.modal');
            })
        }

        $modal.modal();
    }
});
