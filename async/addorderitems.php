<?php

    /**
     * Cart_AddOrderItems_AsyncAction class file.
     *
     * @author Alexander Babayev <aleksander.babayev@gmail.com>
     * @copyright Copyright &copy; 2008-2015 Alexander Babayev
     */
    
    
    // Load abstract action
    ClassLoader::loadAsyncActionClass('basic.abstract');
    

    /**
     * Add order items
     *
     * @author Alexander Babayev <aleksander.babayev@gmail.com>
     * @copyright Copyright &copy; 2008-2015 Alexander Babayev
     * @created 2015.04.17
     * @updated 2016.01.29 Available quantity ignores in_stock
     * @updated 2016.02.23 Added ability to put specific price value
     * @updated 2016.03.16 by Alexander Babayev <aleksander.babayev@gmail.com>: If client's has dc flag is set than only client specific price is used
     * @updated 2016.03.16 by Alexander Babayev <aleksander.babayev@gmail.com>: Do not change item quantity if record with specified code has been already added
     */
    class Cart2_AddOrderItems_AsyncAction extends Basic_Abstract_AsyncAction
    {
        
        /**
         * Performs the action
         */
        public function perform(array $_params = array())
        {
            $mySql = Application::getService('basic.mysqlmanager');
            
            $orderId = $this->_getPositiveInteger('orderId', $_params, true);
            $newItems = $this->_getString('items', $_params);
            if ($newItems == '') throw new AsyncActionException('Введите хотя бы один код продутка.');
            
            
            // Extract order record
            $order = $mySql->select('*', 'orders', array('id' => $orderId))->fetchAssoc();
            if ($order == false) throw new AsyncActionException('Заказ не найден.');
            
            
            // Extract client record
            $client = $mySql->select('*', 'clients', array('id' => $order['client_id']))->fetchAssoc();
            
            
            // Extract existing order items
            $items = $mySql->select('*', 'orderItems', array('orderId' => $orderId))->fetchAllAsMap('code');
            
            
            // Parse new items (to be added to the order)
            $newItems = str_replace("\t", ' ', $newItems);
            do { $newItems = str_replace('  ', ' ', $newItems, $count); } while ($count);
            $newItems = explode("\n", $newItems);
            $newItemsMap = array();
            foreach ($newItems as $item)
            {
                $item = trim($item);
                list($code, $quantity, $price) = explode(' ', $item);
                $newItemsMap[$code]['quantity'] = is_null($quantity) ? 1 : $quantity;
                $newItemsMap[$code]['price'] = is_null($price) ? null : (str_replace(',', '.', $price));
            }
            
            
            // Add new order item records to the order
            if (count($newItemsMap))
            {
                $now = date('Y-m-d H:i:s');
                $errors = array();
                if ($client and $client['dc'])
                    $clientPrices = $mySql->query('SELECT `products`.`code`, `client_prices`.`price_usd`
                        FROM `products`
                        LEFT JOIN `client_prices` ON (`products`.`id`=`client_prices`.`product_id`)
                        WHERE `client_id`='.$client['id'].' AND `products`.`code` IN (\''.implode('\',\'', array_keys($newItemsMap)).'\')')->fetchAllAsKeyValueMap('code', 'price_usd');

                
                foreach ($newItemsMap as $code => $newItem)
                {
                    $product = $mySql->select('*', 'products', array('code' => $code, 'active' => 1))->fetchAssoc();
                    if ($product === false)
                    {
                        $errors[] = 'Продукт с кодом \''.$code.'\' не найден.';
                        continue;
                    }
                    
                    if (filter_var($newItem['quantity'], FILTER_VALIDATE_INT, array('options' => array('min_range' => 0))) === false)
                    {
                        $errors[] = 'Неверный формат данных ('.$code.' '.$newItem['quantity'].').';
                        continue;
                    }
                    
                    if (!is_null($newItem['price']) and filter_var($newItem['price'], FILTER_VALIDATE_FLOAT) === false)
                    {
                        $errors[] = 'Неверный формат данных ('.$code.' '.$newItem['quantity'].' '.$newItem['price'].').';
                        continue;
                    }
                    
                    
                    if (array_key_exists($code, $items))
                        $errors[] = 'Позиция с кодом '.$code.' уже присутсвует в заказе.';
                    
                    else
                    {
                        $price = $product['price_usd'];
                        if (!is_null($newItem['price']))
                            $price = $newItem['price'];
                        elseif ($client and $client['dc'])
                            $price = isset($clientPrices[$code]) ? $clientPrices[$code] : null;
                        $mySql->insert('orderItems',
                            array(
                                'orderId' => $orderId,
                                'added' => $now,
                                'code' => $code,
                                'name' => $product['name'].' '.$product['description'],
                                'requiredQuantity' => $newItem['quantity'],
                                'availableQuantity' => $newItem['quantity'],
                                'price' => $price
                            )
                        );
                    }
                }
            }

            
            $this->data['errors'] = $errors;
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