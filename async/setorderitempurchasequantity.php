<?php

    /**
     * Cart_SetOrderItemPurchaseQuantity_AsyncAction class file.
     *
     * @author Alexander Babayev <aleksander.babayev@gmail.com>
     * @copyright Copyright &copy; 2008-2015 Alexander Babayev
     */
    
    
    // Load abstract action
    ClassLoader::loadAsyncActionClass('basic.abstract');
    

    /**
     * Set order item purchase quantity
     *
     * @author Alexander Babayev <aleksander.babayev@gmail.com>
     * @copyright Copyright &copy; 2008-2015 Alexander Babayev
     * @created 2015.09.28
     */
    class Cart2_SetOrderItemPurchaseQuantity_AsyncAction extends Basic_Abstract_AsyncAction
    {
        
        /**
         * Performs the action
         */
        public function perform(array $_params = array())
        {
            $mySql = Application::getService('basic.mysqlmanager');
            
            // Extract arguments
            $id = $this->_getPositiveInteger('id', $_params, true);
            $quantity = $this->_getNonNegativeInteger('q', $_params, true);
            
            
            // Extract order item
            $orderItem = $mySql->select('*', 'orderItems', array('id' => $id))->fetchAssoc();
            if ($orderItem == false) throw new AsyncActionException('Позиция не найдена.');
            
            
            // Extract order created
            $orderCreated = $mySql->select('created', 'orders', array('id' => $orderItem['orderId']))->fetchCellValue('created');
            
            
            // Extract product
            $product = $mySql->select('*', 'products', array('code' => $orderItem['code']))->fetchAssoc();
            if ($product == false) throw new AsyncActionException('Продукт не найден.');
            
            
            // Extract or create purchase record
            $purchase = $mySql->select('*', 'purchases', array('orderId' => $orderItem['orderId']))->fetchAssoc();
            if ($purchase === false)
            {
                $purchase = array(
                    'orderId' => $orderItem['orderId'],
                    'created' => $orderCreated,
                    'code' => $orderItem['orderId']);
                $purchase['id'] = $mySql->insert('purchases', $purchase)->getInsertId();
            }
            
            
            // Create or update purchase item record
            $purchaseItemId = $mySql->select('id', 'purchaseItems', array('purchaseId' => $purchase['id'], 'code' => $product['code']))->fetchCellValue('id');
            if (!$purchaseItemId)
                $purchaseItem['id'] = $mySql->insert(
                        'purchaseItems',
                        array(
                            'purchaseId' => $purchase['id'],
                            'code' => $product['code'],
                            'name' => $product['name'],
                            'price' => $product['price_market'],
                            'quantity' => $quantity)
                    )->getInsertId();
            else
                $mySql->update('purchaseItems', array('quantity' => $quantity), array('id' => $purchaseItemId));
        }
        
    }

?>