<?php

    /**
     * Cart_DeleteOrder_AsyncAction class file.
     *
     * @author Alexander Babayev <aleksander.babayev@gmail.com>
     * @copyright Copyright &copy; 2008-2015 Alexander Babayev
     */
    
    
    // Load abstract action
    ClassLoader::loadAsyncActionClass('basic.abstract');
    

    /**
     * Delete order
     *
     * @author Alexander Babayev <aleksander.babayev@gmail.com>
     * @copyright Copyright &copy; 2008-2015 Alexander Babayev
     * @created 2015.04.29
     */
    class Cart2_DeleteOrder_AsyncAction extends Basic_Abstract_AsyncAction
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
            
            
            // Delete order record
            $mySql->delete('orders', array('id' => $id));
        }
        
    }

?>