<?php

    // Load abstract action
    ClassLoader::loadAsyncActionClass('basic.abstract');
    

    class Cart2_SetOrderStatus_AsyncAction extends Basic_Abstract_AsyncAction
    {
        
        /**
         * Performs the action
         */
        public function perform(array $_params = array())
        {
            $mySql = Application::getService('basic.mysqlmanager');
            
            $id = $this->_getPositiveInteger('id', $_params, true);
            $status = $this->_getString('status', $_params, true);
            if($status == 'ЗАКРЫТ')
                $result = $this->_getString('result', $_params);
            
            // Ensure order exsits
            if ($mySql->count('orders', array('id' => $id)) == 0) throw new AsyncActionException('Заказ не найден.');
            
            // Update order record: set usd rate
            $orderData = array('status' => $status);
            if (!empty($result))
                $orderData['result'] = $result;
            $mySql->update('orders', $orderData, array('id' => $id));
        }
        
    }

?>