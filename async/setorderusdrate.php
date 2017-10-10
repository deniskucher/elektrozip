<?php

// Load abstract action
    ClassLoader::loadAsyncActionClass('basic.abstract');


    /**
     * Set Order UsdRate action
     *
     * @author Denis Kucher <dkucher88@gmail.com>
     * @copyright Copyright &copy; 2017
     * @created 2017.06.18
     */

    class Basic_SetOrderUsdRate_AsyncAction extends Basic_Abstract_AsyncAction
    {
        
        /**
         * Performs the action
         */
        public function perform(array $_params = array())
        {
            $mySql = Application::getService('basic.mysqlmanager');
            $orderId = $this->_getString('id', $_params, true);
            
            $val = $this->_getString('value', $_params, true);

            if ($mySql->count('orders', array('id' => $orderId)) == 0) throw new AsyncActionException('Order record not found.');
            // Update record
            $mySql->update('orders', array('usdRate' => $val), array('id' => $orderId));
        }
    }

