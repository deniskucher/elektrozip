$.widget('xb.usersManager', $.xb.abstractManager, {

    options: {
        dummy: 'dummy',
        moduleName: 'basic',
        entityName: 'user',
        tableName: 'users',
        filters: [
            {key: 'userRoleId', name: 'Positions', type: 'select', action: 'getrolesusers'}
        ],

        filtersReset: true,
        list: {
            deletable: false,
            fields: [
                {key: 'login', name: 'Login', editable: true},
                {key: 'name', name: 'Name', editable: true},
                {key: 'userRoleId', name: 'Role', type: 'select', action: 'getrolesusers'},
                {key: 'companyId', name: 'Company', editable: true},
                {key: 'active', name: 'Active', editable: true},
                {key: 'head', name: 'Head', editable: true}
            ]
        },
        createInputs:[
            {key: 'username', name: 'Login', type: 'text', required: true, minLength: 4, maxLength: 50, unique: true, action: 'checkloginunique'},
            {key: 'name', name: 'Name', type: 'text', required: true, minLength: 3, maxLength: 50},
            {key: 'password', name: 'Password', type: 'password', required: true, minLength: 6, maxLength: 18},
            {key: 'role', name: 'Position', type: 'select', action: 'basic.getrolesusers', required: true}
        ]
    },
    

    _create: function () {
        var widget = this;
        widget._super();
    },

});
