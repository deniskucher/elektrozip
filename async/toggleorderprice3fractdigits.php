<?php

    // Load abstract action
    ClassLoader::loadAsyncActionClass('basic.abstract');
    

    class Cart2_ToggleOrderPrice3FractDigits_AsyncAction extends Basic_Abstract_AsyncAction
    {
        
        /**
         * Performs the action
         */
        public function perform(array $_params = array())
        {
            $mySql = Application::getService('basic.mysqlmanager');
            
            // Extract order ID
            $id = $this->_getPositiveInteger('id', $_params, true);
            

            // Ensure order exsits
            $order = $mySql->select('*', 'orders', array('id' => $id))->fetchAssoc();
            if ($order == null) throw new AsyncActionException('Заказ не найден.');
            

            // Update order record: toggle price3FractDigits
            $mySql->update('orders',  array('price3FractDigits' => $order['price3FractDigits'] ? 0 : 1), array('id' => $id));
        }
        
    }

?>