<?php


    // Load abstract action
    ClassLoader::loadAsyncActionClass('basic.abstract');


    class Cart2_GetClients_AsyncAction extends Basic_Abstract_AsyncAction
    {

        /**
         * Performs the action
         */
        public function perform(array $_params = array())
        {
            $mySql = Application::getService('basic.mysqlmanager');

            $clients = $mySql->select(array('id', 'name', 'sales_channel', 'city'), 'clients', '1', 'name')->fetchAll();

            //$clients = $mySql->select(array('id', 'name', 'sales_channel'), 'clients', '1', 'name')->fetchAllAsMap('id');

            $this->data['list'] = $clients;
        }

    }

?>