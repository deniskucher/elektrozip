<?php

    /**
     * Cart2_SetClientPrice_AsyncAction class file.
     *
     * @author Alexander Babayev <aleksander.babayev@gmail.com>
     * @copyright Copyright &copy; 2008-2016 Alexander Babayev
     */
    
    
    // Load abstract action
    ClassLoader::loadAsyncActionClass('basic.abstract');
    

    /**
     * Set client price
     *
     * @author Alexander Babayev <aleksander.babayev@gmail.com>
     * @copyright Copyright &copy; 2008-2016 Alexander Babayev
     * @created 2016.03.16
     */
    class Cart2_SetClientPrice_AsyncAction extends Basic_Abstract_AsyncAction
    {
        
        /**
         * Performs the action
         */
        public function perform(array $_params = array())
        {
            $mySql = Application::getService('basic.mysqlmanager');
            
            $id = $this->_getPositiveInteger('id', $_params, true);
            $price = $this->_getPositiveFloat('price', $_params, true);
            
            
            // Extract client price record
            $clientPrice = $mySql->select('*', 'client_prices', array('id' => $id))->fetchAssoc();
            if ($clientPrice == false) throw new AsyncActionException('Позиция не найдена.');
            
            
            // Set client price
            $mySql->update('client_prices', array('price_usd' => $price), array('id' => $id));
        }
        
    }

?>