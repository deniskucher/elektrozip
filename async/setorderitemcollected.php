<?php

    /**
     * Cart_SetOrderItemCollected_AsyncAction class file.
     *
     * @author Alexander Babayev <aleksander.babayev@gmail.com>
     * @copyright Copyright &copy; 2008-2016 Alexander Babayev
     */
    
    
    // Load abstract action
    ClassLoader::loadAsyncActionClass('basic.abstract');
    

    /**
     * Set order item collected
     *
     * @author Alexander Babayev <aleksander.babayev@gmail.com>
     * @copyright Copyright &copy; 2008-2016 Alexander Babayev
     * @created 2016.01.28
     */
    class Cart2_SetOrderItemCollected_AsyncAction extends Basic_Abstract_AsyncAction
    {
        
        /**
         * Performs the action
         */
        public function perform(array $_params = array())
        {
            $mySql = Application::getService('basic.mysqlmanager');
            
            $id = $this->_getPositiveInteger('id', $_params, true);
            $collected = $this->_getNonNegativeInteger('collected', $_params, true);
            
            
            // Extract order item
            $orderItem = $mySql->select('*', 'orderItems', array('id' => $id))->fetchAssoc();
            if ($orderItem == false) throw new AsyncActionException('Позиция не найдена.');
            
            
            // Extract product
            $product = $mySql->select('*', 'products', array('code' => $orderItem['code']))->fetchAssoc();
            if ($product == false) throw new AsyncActionException('Продукт не найден.');
            
            
            // Update order item record: set collected
            $mySql->update('orderItems', array('collected' => $collected), array('id' => $id));
        }
        
    }

?>