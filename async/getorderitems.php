<?php

   
    // Load abstract action
    ClassLoader::loadAsyncActionClass('basic.abstract');
    

    
    class Cart2_GetOrderItems_AsyncAction extends Basic_Abstract_AsyncAction
    {
        
        /**
         * Performs the action
         */
        public function perform(array $_params = array())
        {
            $mySql = Application::getService('basic.mysqlmanager');
            
            // Extract arguments
            $id = $this->_getString('id', $_params, false);
            
            
            // Extract order
            $order = $mySql->select('*', 'orders', array('id' => $id))->fetchAssoc();
            if ($order == false) throw new AsyncActionException('Заказ не найден.');
            
            
            // Extract order items
            $order['items'] = $mySql->select('*', 'orderitems', array('orderId' => $id))->fetchAll();
            
           
            foreach ($order['items'] as &$item)
            {
                $code = $item['code'];
                $item['img'] = $mySql->select('image_thumb', 'products', array('code' => $code))->fetchCellValue('image_thumb');
                if (is_null($item['img'])) {
                   $item['img'] = 'http://basket_js/images/elektrozip/product-no-photo.png';
                }
                else
                {
                    //$item['img'] = Viewer::resolveUrl(substr($item['img'], 2));
                    $item['img'] = Viewer::resolveUrl($item['img']);
                }
                                        
            }

            $order['usdRate'] = $mySql->select('usdRate', 'orders', array('id' => $id))->fetchCellValue('usdRate');

            $this->data['order'] = $order;
            //$this->data['orderitems'] = $orderItems;
        }
        
    }

?>