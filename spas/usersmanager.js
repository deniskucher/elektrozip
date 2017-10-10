$.widget('xbspa.usersmanager', $.xbspa.abstract, {

    options: {
        dummy: 'dummy',
        appName: 'Users Manager'
    },
    

    _create: function () {
        var widget = this;
        widget._super();
    },
    
    
    _renderContent: function(_data) {
        var widget = this;
        widget._super();

        //! [2017.05.30] [Alexander Babayev]: Порефакторить.
        var optionsData = null;
        if(typeof _data.editAccess !== 'undefined')
        {
            optionsData={};
            optionsData.editAccess = _data.editAccess;
            if(optionsData.editAccess == true) console.log('Editing of records is allowed');
            else console.log('Editing of records is forbidden');
        }
        
        $.getScript(
            '/application/modules/basic/widgets/abstractmanager.js'
        ).fail(function(jqxhr, settings, exception) {
            alert('Failed to load abstract manager widget script.');
        }).done(function(script, textStatus) {
            $.getScript(
                '/application/modules/basic/widgets/usersmanager.js'
            ).fail(function(jqxhr, settings, exception) {
                alert('Failed to load basic users widget script.');
            }).done(function(script, textStatus) {
                $.xb.usersManager(optionsData, '#content');
            });
        });
    }

});
