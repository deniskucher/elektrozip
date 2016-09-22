<?php
 
    // Load abstract action
    ClassLoader::loadAsyncActionClass('basic.abstract');
    

    class Cart2_AddCartOrderItems_AsyncAction extends Basic_Abstract_AsyncAction
    {
        
        public function perform(array $_params = array())
        {
            $mySql = Application::getService('basic.mysqlmanager');
			$order_Id = $this->_getString('order_id', $_params, false);
			$product_id = $this->_getString('product_id', $_params, false);
            $add = $this->_getString('add', $_params, false);
            $update = $this->_getString('update', $_params, false);
            $num = $this->_getString('num', $_params, false);

			$usdRate = $mySql->select('value', 'settings', array('key' => 'usd_rate'))->fetchCellValue('value');
			
			if ($update) {
				$insert_orderitems = $mySql->query("UPDATE orderitems SET requiredQuantity = '$num', availableQuantity = '$num' WHERE orderId='$order_Id' AND code='$product_id'");
			}
			else{
				if(!$order_Id) 
	            { 
	                $mySql->insert('orders', array('usdRate' => $usdRate, 'status'=> 'КОРЗИНА', 'sales_channel'=> 'Сайт: Корзина')); 
	                $order_Id = $mySql->getInsertId();
	            
	            }
				
				$order = $mySql -> select('*', 'orders', array('id' => $order_id))->fetchAssoc();
				
	            $this->data['order'] = $order;
	            
	            $product = $mySql->select('*', 'products', array('id' => $product_id, 'active' => 1))->fetchAssoc();
				$prod_code = $product['code'];
	            
				
				$product_isexist = $mySql->select('*','orderitems', array('orderId'=>$order_Id, 'code'=> $product['code']))->fetchAssoc();

				if(!$product_isexist) 
	            { 
					$mySql->insert('orderitems',
		                array(
		                    'orderId' => $order_Id,
		                    'code' => $prod_code,
		                    'name' => $product['name'].' '.$product['description'],
		                    'requiredQuantity' => $num,
		                    'availableQuantity' => $num,
		                    'price' => $product['price_usd']
		                )
		            );
	           }
			   else
			   {
			   				   		
			   		if($add){
			   				$insert_orderitems = $mySql->query("UPDATE orderitems SET requiredQuantity = requiredQuantity + '$num', availableQuantity = availableQuantity + '$num' WHERE orderId='$order_Id' AND code='$prod_code'");  
					}
					else{
					   $insert_orderitems =  $mySql->query("UPDATE orderitems SET requiredQuantity = requiredQuantity - '$num', availableQuantity = availableQuantity - '$num' WHERE orderId='$order_Id' AND code='$prod_code'");  
					}
				}
			}
			$order = $mySql -> select('*', 'orders', array('id' => $order_id))->fetchAssoc();
			$this->data['order'] = $order;
			$this->data['id'] = $order_Id;
        }
    }
        

?>