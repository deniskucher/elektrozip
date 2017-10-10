/**
 * Dashboard widget
 *
 * @author Alexander Kudrya <alexkudrya91@gmail.com>
 * @copyright Copyright &copy; 2017
 * @created 2017.05.12
 * @updated 2017.05.13 added default image if [image == null] -> require file -> [/application/modules/basic/images/default-app-image.png]
 * @updated 2017.05.13 widget do mot check user access
 */
$.widget('xbspa.dashboard', $.xbspa.abstract, {

    options: {
        dummy: 'dummy',
        appName: 'Dashboard',
        moduleName: 'basic'
    },
    

    _create: function () {
        var widget = this;
        this._super();
        
    },
    
    
    _renderContent: function(_data) {
        var widget = this;
        widget._super();
        sendRequest({
            action: widget.options.moduleName+'.getapplications',
            //! [2017.05.30] [Alexander Babayev]: Думаю, здесь нет необходимости передавать роль...
            data: {userRole: widget.options.user.userRoleId},
            successHandler: function(_callbackParams) {
                var response = _callbackParams.response;
                if (!response.success) alert(response.message);
                else
                {
                    var $content = $('<div/>', {class: 'row'}).appendTo(widget.element.find('#content'));
                    var applications = response.data.applications;
                    for(var applicationId in applications)
                    {
                        var application = applications[applicationId];

                        //debug data
                        //! [2017.05.30] [Alexander Babayev]: Надо продумать, как бы нам не засорять код отладочными процедурами...
                        widget._debug(application);

                        //parse data to variables
                        var image = '';
                        if(application.image==null) image = '/application/modules/basic/images/default-app-image.png';
                        else image = '/application/modules/'+application.module+'/images/'+application.image;
                        var name = application.name;
                        var link = '/application/'+application.module+'.'+application.alias;

                        //display data
                        $content.append(
                            $('<div/>', {class: 'col-xs-3 col-sm-2 col-md-2'}).append(
                                $('<div/>', {class: 'thumbnail'}).css('text-align','center').append(
                                    $('<a/>', {target: '_blank', href: link, title: name}).append(
                                        $('<img/>', {src: image, alt: name})
                                    ),
                                    $('<div/>', {class: 'caption'}).append(
                                        $('<a/>', {target: '_blank', href: link, title: name}).append(
                                            $('<span/>').text(name)
                                        )
                                    )
                                )
                            )
                        )
                    }
                }
            }
        });
    },


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
            widget._renderContent(_data);
        }
    }
});
