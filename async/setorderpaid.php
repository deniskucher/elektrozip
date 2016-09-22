<?php

    // Load abstract action
    ClassLoader::loadAsyncActionClass('basic.abstract');
    

    class Cart2_SetOrderPaid_AsyncAction extends Basic_Abstract_AsyncAction
    {
        
        /**
         * Performs the action
         */
        public function perform(array $_params = array())
        {
            $mySql = Application::getService('basic.mysqlmanager');
            
            $id = $this->_getPositiveInteger('id', $_params, true);
            $paid = $this->_getBoolean('paid', $_params, true);
            
            
            // Ensure order exsits
            if ($mySql->count('orders', array('id' => $id)) == 0) throw new AsyncActionException('Заказ не найден.');
            
            
            // Update order record: set usd rate
            $mySql->update('orders',  array('paid' => $paid), array('id' => $id));
        }
        
    }

?>