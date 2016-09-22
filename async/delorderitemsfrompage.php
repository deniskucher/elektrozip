<?php
 
    // Load abstract action
    ClassLoader::loadAsyncActionClass('basic.abstract');
    

    class Cart2_DelOrderItemsFromPage_AsyncAction extends Basic_Abstract_AsyncAction
    {
        
        /**
         * Performs the action
         */
        public function perform(array $_params = array())
        {
            $mySql = Application::getService('basic.mysqlmanager');
			$order_Id = $this->_getString('order_id', $_params, false);
			$product_id = $this->_getString('product_id', $_params, false);
           
			$product = $mySql->select('*', 'products', array('code' => $product_id, 'active' => 1))->fetchAssoc();
			$prod_code = $product['code'];
			$product_isexist = $mySql->select('*','orderitems', array('orderId'=>$order_Id, 'code'=> $product['code']))->fetchAssoc();
			
			if($product_isexist) 
            { 
			// $delete_orderitems = mysql_query("DELETE FROM orderitems WHERE orderId='$order_Id' AND code='$prod_code'");  
                $delete_orderitems = $mySql->delete('orderitems', array('orderId'=>$order_Id, 'code'=> $prod_code));  
			}
			
        }

    }
        

?>