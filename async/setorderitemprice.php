<?php

    /**
     * Cart_SetOrderItemPrice_AsyncAction class file.
     *
     * @author Alexander Babayev <aleksander.babayev@gmail.com>
     * @copyright Copyright &copy; 2008-2015 Alexander Babayev
     */
    
    
    // Load abstract action
    ClassLoader::loadAsyncActionClass('basic.abstract');
    

    /**
     * Set order item quantity
     *
     * @author Alexander Babayev <aleksander.babayev@gmail.com>
     * @copyright Copyright &copy; 2008-2015 Alexander Babayev
     * @created 2015.04.22
     * @updated 2016.01.28 Update product price is optional
     */
    class Cart2_SetOrderItemPrice_AsyncAction extends Basic_Abstract_AsyncAction
    {
        
        /**
         * Performs the action
         */
        public function perform(array $_params = array())
        {
            $mySql = Application::getService('basic.mysqlmanager');
            
            $id = $this->_getPositiveInteger('id', $_params, true);
            $price = $this->_getPositiveFloat('price', $_params, true);
            $updateProductPrice = $this->_getBoolean('upp', $_params, false, 0);
            
            
            // Extract order item
            $orderItem = $mySql->select('*', 'orderItems', array('id' => $id))->fetchAssoc();
            if ($orderItem == false) throw new AsyncActionException('Позиция не найдена.');
            
            
            if ($updateProductPrice)
            {
                // Extract order record
                $order = $mySql->select('*', 'orders', array('id' => $orderItem['orderId']))->fetchAssoc();
                if ($order == false) throw new AsyncActionException('Запись заказа не найдена в базе данных.');
                if (!is_null($order['client_id']))
                {
                    // Extract client record
                    $client = $mySql->select('*', 'clients', array('id' => $order['client_id']))->fetchAssoc();
                    if ($client == false) throw new AsyncActionException('Запись клиента не найдена в базе данных.');
                }
            }
            
            
            // Extract product
            $product = $mySql->select('*', 'products', array('code' => $orderItem['code']))->fetchAssoc();
            if ($product == false) throw new AsyncActionException('Продукт не найден.');
            
            
            // Set order item price
            $mySql->update('orderItems', array('price' => $price), array('id' => $id));
            
            
            if ($updateProductPrice)
            {
                if ($client['dc'])
                {
                    if ($mySql->count('client_prices', array('client_id' => $client['id'], 'product_id' => $product['id'])))
                        $mySql->update('client_prices', array('price_usd' => $price), array('client_id' => $client['id'], 'product_id' => $product['id']));
                    else
                        $mySql->insert('client_prices', array('client_id' => $client['id'], 'product_id' => $product['id'], 'price_usd' => $price));
                }
                else
                    $mySql->update('products', array('price_usd' => $price), array('id' => $product['id']));
            }
        }
        
    }

?>