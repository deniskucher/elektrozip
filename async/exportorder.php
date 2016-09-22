<?php

/**
 * Backend_ExportClients_AsyncAction class file.
 *
 * @author Alexander Babayev <aleksander.babayev@gmail.com>
 * @copyright Copyright &copy; 2008-2014 Alexander Babayev &amp Christopher Keenan
 */


// Load abstract action
ClassLoader::loadAsyncActionClass('basic.abstract');


class Cart2_ExportOrder_AsyncAction extends Basic_Abstract_AsyncAction
{

    /**
     * Performs the action
     */
    public function perform(array $_params = array())
    {
        $mySql = Application::getService('basic.mysqlmanager');
        $fields_desc = array(
            'required_quantity' => 'Заказано',
            'available_quantity' => 'Доступно',
            'code' => 'Код',
            'name' => 'Наименование',
            'price' => 'Цена [у.е.]',
            'sum' => 'Сумма [у.е.]',
            'price_hrn' => 'Сумма [грн]',
            'comment' => 'Комментарий',
        );

        $fields = array_keys($fields_desc);
        $fieldsTitles = array_values($fields_desc);

        // Extract arguments
        $id = $this->_getPositiveInteger('id', $_params, true);

        // Extract order
        $order = $mySql->select('*', 'orders', array('id' => $id))->fetchAssoc();
        if ($order == false) throw new AsyncActionException('Заказ не найден.');

        // Extract order items
        $order['items'] = $mySql->select('*', 'orderItems', array('orderId' => $id), '`added` ASC, `code` ASC')->fetchAll();

        // Extract purchased item quantities
        $purchaseId = $mySql->select('id', 'purchases', array('orderId' => $id))->fetchCellValue('id');
        if ($purchaseId) {
            $purchasedItems = $mySql->select(array('code', 'quantity'), 'purchaseItems', array('purchaseId' => $purchaseId))->fetchAllAsKeyValueMap('code', 'quantity');
            foreach ($order['items'] as &$item) {
                if (isset($purchasedItems[$item['code']]))
                    $item['purchasedQuantity'] = $purchasedItems[$item['code']];
            }
        }

        $orderData = array();
        $totalSum = $totalPurchasedItems = '';
        foreach ($order['items'] as $item) {
            $sum = $item['price'] && $item['availableQuantity'] ? $item['availableQuantity'] * $item['price'] : 0;
            $totalSum += $sum;
            $orderData[] = array(
                'required_quantity' => $item['requiredQuantity'],
                'available_quantity' => $item['availableQuantity'],
                'code' => $item['code'],
                'name' => $item['name'],
                'price' => $item['price'],
                'sum' => $sum,
                'price_hrn' => round($sum * $order['usdRate'], 2),
                'comment' => $item['comment']
            );
        }
        $orderData[] = array(
            'required_quantity' => 'ИТОГО:',
            'available_quantity' => '',
            'code' => '',
            'name' => '',
            'price' => '',
            'sum' => round($totalSum, 2),
            'price_hrn' => round($totalSum * $order['usdRate'], 2),
        );

        if ($order['client_id'])
            $orderClient = $mySql->select('*', 'clients', array('id' => $order['client_id']))->fetchAssoc();

        $fileName = $order['id'] . '_' . $order['created'];
        if (!empty($orderClient))
            $fileName .= '_' . $orderClient['name'] . '_' . $orderClient['city'];
        $fileName .= '_' . $order['created'];
        $fileName .= '.xls';
        $this->exportAsXlsToBrowser($fileName, $fieldsTitles, $orderData);
        exit();
    }
}

?>