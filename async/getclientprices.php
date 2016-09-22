<?php

    /**
     * Cart2_GetClientPrices_AsyncAction class file.
     *
     * @author Alexander Babayev <aleksander.babayev@gmail.com>
     * @copyright Copyright &copy; 2008-2016 Alexander Babayev
     */


    // Load abstract action
    ClassLoader::loadAsyncActionClass('basic.abstract');


    /**
     * Get client prices
     *
     * @author Alexander Babayev <aleksander.babayev@gmail.com>
     * @copyright Copyright &copy; 2008-2016 Alexander Babayev
     * @created 2016.03.16
     */
    class Cart2_GetClientPrices_AsyncAction extends Basic_Abstract_AsyncAction
    {

        /**
         * Performs the action
         */
        public function perform(array $_params = array())
        {
            $mySql = Application::getService('basic.mysqlmanager');
            $clientId = $this->_getPositiveInteger('clientId', $_params, true);
            $items = $mySql->query('SELECT `client_prices`.`id`, `products`.`code`, `products`.`name`, `client_prices`.`price_usd`
                FROM `client_prices` LEFT JOIN `products` ON (`client_prices`.`product_id`=`products`.`id`) WHERE `client_id` = '.$clientId.'')->fetchAll();
            $this->data['items'] = $items;
        }

    }

?>