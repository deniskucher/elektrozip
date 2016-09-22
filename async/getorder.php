<?php

    /**
     * Cart_GetOrder_AsyncAction class file.
     *
     * @author Alexander Babayev <aleksander.babayev@gmail.com>
     * @copyright Copyright &copy; 2008-2015 Alexander Babayev
     */
    
    
    // Load abstract action
    ClassLoader::loadAsyncActionClass('basic.abstract');
    

    /**
     * Get order
     *
     * @author Alexander Babayev <aleksander.babayev@gmail.com>
     * @copyright Copyright &copy; 2008-2015 Alexander Babayev
     * @created 2015.04.16
     * @updated 2015.09.28 Added extraction of order item purchased quantities
     */
    class Cart2_GetOrder_AsyncAction extends Basic_Abstract_AsyncAction
    {
        
        /**
         * Performs the action
         */
        public function perform(array $_params = array())
        {
            $mySql = Application::getService('basic.mysqlmanager');
            
            // Extract arguments
            $id = $this->_getPositiveInteger('id', $_params, true);
            
            
            // Extract order
            $order = $mySql->select('*', 'orders', array('id' => $id))->fetchAssoc();
            if ($order == false) throw new AsyncActionException('Заказ не найден.');
            
            
            // Extract order items
            //$order['items'] = $mySql->select('*', 'orderItems', array('orderId' => $id), '`added` ASC, `code` ASC')->fetchAll();
            //$order['items'] = $mySql->query("SELECT *, IFNULL(`alternative_for_id`, `id`) as `order_alt` FROM `orderItems` WHERE `orderId` = {$id} ORDER BY `order_alt` ASC, `alternative_for_id` ASC, `added` ASC, `code` ASC")->fetchAll();
            $order['items'] = $mySql->query(
                "SELECT `orderItems`.*, IFNULL(`sort`.`code`, `orderItems`.`code`) AS `order_code` FROM `orderItems`"
                ."LEFT JOIN `orderItems` as `sort` ON `orderItems`.`alternative_for_id`=`sort`.`id`"
                ."WHERE `orderItems`.`orderId` = {$id} ORDER BY `order_code` ASC, `orderItems`.`alternative_for_id` ASC, `orderItems`.`added` ASC"
            )->fetchAll();
            
            // Extract purchased item quantities
            $purchaseId = $mySql->select('id', 'purchases', array('orderId' => $id))->fetchCellValue('id');
            if ($purchaseId)
            {
                $purchasedItems = $mySql->select(array('code', 'quantity'), 'purchaseItems', array('purchaseId' => $purchaseId))->fetchAllAsKeyValueMap('code', 'quantity');
                foreach ($order['items'] as &$item)
                {
                    if (isset($purchasedItems[$item['code']]))
                        $item['purchasedQuantity'] = $purchasedItems[$item['code']];
                }
            }

            // Extract order collector
            $order['collector'] = $mySql->select('*', 'users', array('id' => $order['collector_id']))->fetchAssoc();

            // Extract order client
            $order['client'] = $mySql->select('*', 'clients', array('id' => $order['client_id']))->fetchAssoc();

            $this->data['order'] = $order;
        }
        
    }

?>