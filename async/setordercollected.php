<?php

    // Load abstract action
    ClassLoader::loadAsyncActionClass('basic.abstract');
    

    class Cart2_SetOrderCollected_AsyncAction extends Basic_Abstract_AsyncAction
    {
        
        /**
         * Performs the action
         */
        public function perform(array $_params = array())
        {
            $mySql = Application::getService('basic.mysqlmanager');
            
            $id = $this->_getPositiveInteger('id', $_params, true);

            // Ensure order exsits
            if (!$order = $mySql->select('*', 'orders', array('id' => $id))->fetchAssoc())
                throw new AsyncActionException('Заказ не найден.');
            $status = ($order['payment'] == 'НП') ? 'ОТПРАВКА' : 'ОПЛАТА';

            // Update order record: set usd rate
            $mySql->update('orders',  array('status' => $status), array('id' => $id));
            $this->mail(OPERATOR_MAIL, "Заказ №{$order[id]} собран", HTTP_HOSTNAME . "zzzakaz2?user=operator#{$order[id]}");
        }
        
    }

?>