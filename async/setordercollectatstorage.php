<?php

    // Load abstract action
    ClassLoader::loadAsyncActionClass('basic.abstract');
    

    class Cart2_SetOrderCollectAtStorage_AsyncAction extends Basic_Abstract_AsyncAction
    {
        
        /**
         * Performs the action
         */
        public function perform(array $_params = array())
        {
            $mySql = Application::getService('basic.mysqlmanager');
            
            // Extract order ID
            $id = $this->_getPositiveInteger('id', $_params, true);
            if (!$order = $mySql->select('*', 'orders', array('id' => $id))->fetchAssoc()) throw new AsyncActionException('Заказ не найден.');
            
            // Extract value to be set
            $value = $this->_getBoolean('value', $_params, true);

            // Update order record: set collectAtStorage flag
            $mySql->update('orders',  array('collectAtStorage' => $value), array('id' => $id));
        }
        
    }

?>