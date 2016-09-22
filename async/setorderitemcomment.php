<?php

    /**
     * Cart_SetOrderItemComment_AsyncAction class file.
     *
     * @author Alexander Babayev <aleksander.babayev@gmail.com>
     * @copyright Copyright &copy; 2008-2015 Alexander Babayev
     */
    
    
    // Load abstract action
    ClassLoader::loadAsyncActionClass('basic.abstract');
    

    /**
     * Set order item comment
     *
     * @author Alexander Babayev <aleksander.babayev@gmail.com>
     * @copyright Copyright &copy; 2008-2015 Alexander Babayev
     * @created 2015.07.08
     */
    class Cart2_SetOrderItemComment_AsyncAction extends Basic_Abstract_AsyncAction
    {
        
        /**
         * Performs the action
         */
        public function perform(array $_params = array())
        {
            $mySql = Application::getService('basic.mysqlmanager');
            
            $id = $this->_getPositiveInteger('id', $_params, true);
            $comment = $this->_getString('comment', $_params, false);
            
            
            // Extract order item
            $orderItem = $mySql->select('*', 'orderItems', array('id' => $id))->fetchAssoc();
            if ($orderItem == false) throw new AsyncActionException('Позиция не найдена.');
            
            
            // Extract product
            $product = $mySql->select('*', 'products', array('code' => $orderItem['code']))->fetchAssoc();
            if ($product == false) throw new AsyncActionException('Продукт не найден.');
            
            
            // Update order item record: set comment
            $mySql->update('orderItems', array('comment' => $comment), array('id' => $id));
        }
        
    }

?>