<?php

    /**
     * Cart2_SetOrderMarketPrices_AsyncAction class file.
     *
     * @author Alexander Babayev <aleksander.babayev@gmail.com>
     * @copyright Copyright &copy; 2008-2015 Alexander Babayev
     */
    
    
    // Load abstract action
    ClassLoader::loadAsyncActionClass('basic.abstract');
    

    /**
     * Set order market prices
     *
     * @author Alexander Babayev <aleksander.babayev@gmail.com>
     * @copyright Copyright &copy; 2008-2016 Alexander Babayev
     * @created 2016.02.22
     */
    class Cart2_SetOrderMarketPrices_AsyncAction extends Basic_Abstract_AsyncAction
    {
        
        /**
         * Performs the action
         */
        public function perform(array $_params = array())
        {
            $mySql = Application::getService('basic.mysqlmanager');
            
            // Extract order ID
            $id = $this->_getPositiveInteger('id', $_params, true);
            
            
            // Ensure order exists
            if ($mySql->count('orders', array('id' => $id)) == 0) throw new AsyncActionException('Заказ не найден.');
            
            
            // Set market prices
            $mySql->query('UPDATE `orderItems` SET `price`=(SELECT `price_market` FROM `products` WHERE `orderItems`.`code`=`products`.`code`) WHERE `orderId`='.$id.'');
        }
        
    }

?>