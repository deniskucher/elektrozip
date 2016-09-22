<?php

    /**
     * Cart_CreateOrder_AsyncAction class file.
     *
     * @author Alexander Babayev <aleksander.babayev@gmail.com>
     * @copyright Copyright &copy; 2008-2015 Alexander Babayev
     */
    
    
    // Load abstract action
    ClassLoader::loadAsyncActionClass('basic.abstract');
    

    /**
     * Create order
     *
     * @author Alexander Babayev <aleksander.babayev@gmail.com>
     * @copyright Copyright &copy; 2008-2015 Alexander Babayev
     * @created 2015.04.29
     */
    class Cart2_CreateOrder_AsyncAction extends Basic_Abstract_AsyncAction
    {
        
        /**
         * Performs the action
         */
        public function perform(array $_params = array())
        {
            $mySql = Application::getService('basic.mysqlmanager');
            //$id = $this->_getPositiveInteger('id', $_params, true);
            $clientId = $this->_getPositiveInteger('client_id', $_params, true);
            $salesChannel = $this->_getString('sales_channel', $_params, true);

            // Ensure order with specified ID does not exist yet
            //if ($mySql->count('orders', array('id' => $id))) throw new AsyncActionException('Заказ с таким номером уже существует.');

            // Insert order record
            $usdRate = $mySql->select('value', 'settings', array('key' => 'usd_rate'))->fetchCellValue('value');
            $mySql->insert('orders', array('client_id' => $clientId, 'sales_channel' => $salesChannel, 'payment'=>'КАРТА', 'usdRate' => $usdRate));

            $this->data['id'] = $mySql->getInsertId();
        }
        
    }

?>