<?php


    // Load abstract action
    ClassLoader::loadAsyncActionClass('basic.abstract');


    class Cart2_GetOrders_AsyncAction extends Basic_Abstract_AsyncAction
    {

        /**
         * Performs the action
         */
        public function perform(array $_params = array())
        {
            $mySql = Application::getService('basic.mysqlmanager');

            
            // Extract inputs
            $mode = $this->_getString('mode', $_params, false, 'not_closed');
            $filters = $this->_getArray('filters', $_params, false, array());
            
            
            // Compose filter
            $filterClause = '1';
            switch ($mode) {
                case 'not_closed':
                    $statusClosed = 'ЗАКРЫТ';
                    $filterClause .= " AND `status` <> '{$statusClosed}'";
                    break;
                case 'to_assembly':
                    $statusClosed = 'СБОРКА';
                    $filterClause .= " AND `status` = '{$statusClosed}'";
                    break;
            }
            if (count($filters))
            {
                if (isset($filters['clientName']) and $filters['clientName'] != '')
                {
                    // Get client ID by client name
                    $clientIds = $mySql->select(array('id'), 'clients', '`name` LIKE \'%'.$filters['clientName'].'%\'')->fetchAllCellValue('id');
                    if (count($clientIds))
                        $filterClause .= " AND `client_id` IN (".implode(',', $clientIds).")";
                }
            }

            
            $orders = $mySql->select('*', 'orders', $filterClause)->fetchAll();
            $this->data['list'] = $orders;
        }

    }

?>