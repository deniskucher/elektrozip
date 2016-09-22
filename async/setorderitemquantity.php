<?php

    /**
     * Cart_SetOrderItemQuantity_AsyncAction class file.
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
     * @created 2015.04.20
     */
    class Cart2_SetOrderItemQuantity_AsyncAction extends Basic_Abstract_AsyncAction
    {
        
        /**
         * Performs the action
         */
        public function perform(array $_params = array())
        {
            $mySql = Application::getService('basic.mysqlmanager');
            
            $id = $this->_getPositiveInteger('id', $_params, true);
            $quantity = $this->_getPositiveInteger('quantity', $_params, true);
            
            
            // Extract order item
            $orderItem = $mySql->select('*', 'orderItems', array('id' => $id))->fetchAssoc();
            if ($orderItem == false) throw new AsyncActionException('Позиция не найдена.');

            $order = $mySql->select('*', 'orders', array('id' => $orderItem['orderId']))->fetchAssoc();
            if ($order == false) throw new AsyncActionException('Заказ не найден.');

            // Extract product
            $product = $mySql->select('*', 'products', array('code' => $orderItem['code']))->fetchAssoc();
            if ($product == false) throw new AsyncActionException('Продукт не найден.');


            $orderItemsData = array(
                'requiredQuantity' => $quantity,
                'availableQuantity' => (is_null($product['in_stock']) or $product['in_stock'] == 1) ? $quantity : 0,
            );
            //$orderItemsData['price'] = $this->getClientPrice($product['id'], $orderItemsData['availableQuantity'], $order['client_id']);

            // Set quantity
            $mySql->update('orderItems',
                $orderItemsData,
                array('id' => $id));
        }

        public function getClientPrice($_product_id, $_quantity, $_client_id)
        {
            $mySql = Application::getService('basic.mysqlmanager');
            $priceFields = array('price_usd', 'price_usd_1', 'price_usd_2');

            if (!$prices = $mySql->select($priceFields, 'client_prices', array('product_id' => $_product_id, 'client_id' => $_client_id))->fetchAssoc())
                $prices = $mySql->select($priceFields, 'products', array('id' => $_product_id))->fetchAssoc();

            if (($_quantity >= 100) and ($prices['price_usd_2'] > 0)) $price = $prices['price_usd_2'];
            else if ($_quantity >= 10 and ($prices['price_usd_1'] > 0)) $price = $prices['price_usd_1'];
            else $price = $prices['price_usd'];

            return $price;
        }

    }

?>