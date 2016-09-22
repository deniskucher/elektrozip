<?php

    /**
     * Cart2_UpdateClient_AsyncAction class file.
     *
     * @author Alexander Babayev <aleksander.babayev@gmail.com>
     * @copyright Copyright &copy; 2008-2016 Alexander Babayev
     */
    
    
    // Load abstract action
    ClassLoader::loadAsyncActionClass('basic.abstract');
    

    /**
     * Update client
     *
     * @author Alexander Babayev <aleksander.babayev@gmail.com>
     * @copyright Copyright &copy; 2008-2016 Alexander Babayev
     * @created 2016.05.05
     */
    class Cart2_UpdateClient_AsyncAction extends Basic_Abstract_AsyncAction
    {
        
        /**
         * Performs the action
         */
        public function perform(array $_params = array())
        {
            $mySql = Application::getService('basic.mysqlmanager');
            
            
            // Extract client ID
            $id = $this->_getPositiveInteger('id', $_params, true);
            $client = $mySql->select('*', 'clients', array('id' => $id))->fetchAssoc();
            if (!$client) throw new AsyncActionException('Client record not found.');
            
            // Extract and validate data
            $data = $this->_getArray('data', $_params, false, $_default = array());
            if (count($data) == 0) throw new AsyncActionException('No data received.');
            if (isset($data['name']) and $data['name']=='') throw new AsyncActionException('Имя не может быть пустым.');
            
            // Update client record
            $mySql->update('clients', $data, array('id' => $id));
        }
        
    }

?>