<?php


// Load abstract action
ClassLoader::loadAsyncActionClass('basic.abstract');


/**
 * Get Order action
 *
 * @author Denis Kucher <dkucher88@gmail.com>
 * @copyright Copyright &copy; 2017
 * @created 2017.06.18
 */
class Basic_GetOrders_AsyncAction extends Basic_Abstract_AsyncAction
{

    /**
     * Performs the action
     */
    public function perform(array $_params = array())
    {
        $mySql = Application::getService('basic.mysqlmanager');

        // Extract inputs
        $query = $this->_getString('query', $_params, false, null);
        $status = $this->_getString('status', $_params, false, null);


        // Query cities
        if($status)
            $criteriaOrders = '`status` = \''.mysql_real_escape_string($status).'\'';
        else
            $criteriaOrders = '1';

            
        // $orders = $mySql->mixedselectDistinct('orders.id, clients.name,clients.phone, client.id, clients.email,orders.status,orders.usdRate,orders.result,orders.created, orders.client_id', array('orders', 'clients'), 
        //         '(orders.client_id=clients.id and ('.$criteria.')) or 
        //         (orders.client_id='.null.' and ('.$criteria.'))','`id` DESC')
        //     ->fetchAll();
        $orders = $mySql->getRecords('orders', $criteriaOrders, '`id` DESC', 10);
        
        $criteriaClients = is_null($query) ? '1' : '`name` LIKE \'%'.mysql_real_escape_string($query).'%\' OR `phone` LIKE \'%'.mysql_real_escape_string($query).'%\' OR `email` LIKE \'%'.mysql_real_escape_string($query).'%\'';

        $clients = $mySql->getRecords('clients', $criteriaClients, 'id');

        $clientsById = array();

        foreach ($clients as $key1 => $client) {
            $clientsById[$client['id']] = $client;
        };

        foreach ($orders as $key => $order) {
            if (!is_null($order['client_id'])) {
                $clientId = $order['client_id'];
                if (isset($clientsById[$clientId])) {
                    $orders[$key]['name'] = $clientsById[$clientId]['name'];
                    $orders[$key]['phone'] = $clientsById[$clientId]['phone'];
                    $orders[$key]['email'] = $clientsById[$clientId]['email'];    
                }else{
                    unset($orders[$key]);
                }
                
            }
        }

        $this->data['records'] = $orders;
        $this->data['clients'] = $clientsById;
    }

}

?>