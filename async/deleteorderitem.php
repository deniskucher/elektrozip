<?php

    /**
     * Cart_DeleteOrderItem_AsyncAction class file.
     *
     * @author Alexander Babayev <aleksander.babayev@gmail.com>
     * @copyright Copyright &copy; 2008-2015 Alexander Babayev
     */
    
    
    // Load abstract action
    ClassLoader::loadAsyncActionClass('basic.abstract');
    

    /**
     * Delete order item
     *
     * @author Alexander Babayev <aleksander.babayev@gmail.com>
     * @copyright Copyright &copy; 2008-2015 Alexander Babayev
     * @created 2015.04.22
     */
    class Cart2_DeleteOrderItem_AsyncAction extends Basic_Abstract_AsyncAction
    {
        
        /**
         * Performs the action
         */
        public function perform(array $_params = array())
        {
            $mySql = Application::getService('basic.mysqlmanager');
            $id = $this->_getPositiveInteger('id', $_params, true);
            $mySql->delete('orderItems', array('id' => $id));
        }
        
    }

?>