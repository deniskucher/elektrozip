<?php

    
    // Load abstract action
    ClassLoader::loadAsyncActionClass('basic.abstract');
    

    class Cart2_CreateClient_AsyncAction extends Basic_Abstract_AsyncAction
    {
        /**
         * Performs the action
         */
        public function perform(array $_params = array())
        {
            $mySql = Application::getService('basic.mysqlmanager');

            $name = $this->_getString('name', $_params, true);
            $sales_channel = $this->_getString('sales_channel', $_params, false);
            $phone = $this->_getString('phone', $_params, false);
            $city = $this->_getString('city', $_params, false);
            $email = $this->_getString('email', $_params, false);

            $clientRec = compact('name','sales_channel','phone','city','email');
            
            // Ensure order with specified ID does not exist yet
            if ($mySql->count('clients', array('name' => $name))) throw new AsyncActionException('Клиент с таким именем уже существует.');
            
            
            // Insert order record
            $mySql->insert('clients', $clientRec);
            $id = $mySql->getInsertId();

            $this->data['id'] = $id;
        }
        
    }

?>