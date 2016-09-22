<?php

    /**
     * Cart2_ImportClientPrices_AsyncAction class file.
     *
     * @author Alexander Babayev <aleksander.babayev@gmail.com>
     * @copyright Copyright &copy; 2008-2016 Alexander Babayev &amp Christopher Keenan
     */


    // Load abstract action
    ClassLoader::loadAsyncActionClass('basic.abstract');


    class Cart2_ImportClientPrices_AsyncAction extends Basic_Abstract_AsyncAction
    {

        /**
         * Performs the action
         */
        public function perform(array $_params = array())
        {
            $mySql = Application::getService('basic.mysqlmanager');
            $messages = array();
            
            
            // Extract and validate clinet ID
            $clientId = $this->_getPositiveInteger('clientId', $_params, true);
            if ($mySql->count('clients', array('id' => $clientId)) == 0)
                throw new AsyncActionException('Запись о клиенте не найдена в базе данных.');
            
            
            // Extract and validate filename
            $allowedExtensions = array('xls', 'xlsx', 'csv');
            $filename = isset($_params['filename']) ? trim($_params['filename']) : null;
            if (empty($filename)) throw new AsyncActionException('Загрузите файл для импорта.');
            $ext = end(explode('.', $filename));
            if (!in_array($ext, $allowedExtensions))
                throw new AsyncActionException('Тип файла должен быть один из: '.implode(',', $allowedExtensions).'.');
            $tmpFilePath = TMP_DIR_PATH.$filename;
            if (!file_exists($tmpFilePath))
                throw new AsyncActionException('Загруженный файл не найден на сервере. Загрузите его снова.');
            
            
            // Read input file
            $records = $this->readFromXls($tmpFilePath, array('startRowIndex' => 2, 'columnsNumber' => 2));
                
                
            // Delete tmp file
            unlink($tmpFilePath);
            
            
            // Insert new contacts
            $countInserted = 0;
            $countUpdated = 0;
            $countNoChange = 0;
            $countErrors = 0;
            foreach ($records as &$record)
            {
                $code = $record[0];
                $price = str_replace(',', '.', $record[1]);
                $productId = $mySql->select('id', 'products', array('code' => $code))->fetchCellValue('id');
                
                if (is_null($productId))
                {
                    $record['РЕЗУЛЬТАТ'] = 'Позиция с таким кодом не найдена в каталоге.';
                    $countErrors += 1;
                }
                elseif (filter_var($price, FILTER_VALIDATE_FLOAT, array('options' => array('min_range' => 0))) === false)
                {
                    $record['РЕЗУЛЬТАТ'] = 'Недействительное значение цены.';
                    $countErrors += 1;
                }
                else
                {
                    $clientPriceId = $mySql->select('id', 'client_prices', array('client_id' => $clientId, 'product_id' => $productId))->fetchCellValue('id');
                    if (is_null($clientPriceId))
                    {
                        // Add new record
                        $mySql->insert('client_prices', array(
                            'client_id' => $clientId,
                            'product_id' => $productId,
                            'price_usd' => $price
                        ));
                        $record['РЕЗУЛЬТАТ'] = 'Позиция добавлена.';
                        $countInserted += 1;
                    }
                    else
                    {
                        // Update existing record
                        $mySql->update('client_prices', array('price_usd' => $price), array('id' => $clientPriceId));
                        if ($mySql->getAffectedRows())
                        {
                            $record['РЕЗУЛЬТАТ'] = 'Цена обновлена.';
                            $countUpdated += 1;
                        }
                        else
                        {
                            $record['РЕЗУЛЬТАТ'] = 'Без изменений.';
                            $countNoChange += 1;
                        }
                    }
                }
            }
            
            // Build messages
            $messages[] = array('type' => 'message', 'message' => count($records).' записей обработано.');
            if ($countErrors)
                $messages[] = array('type' => 'warning', 'message' => $countErrors.' ошибок.');
            if ($countUpdated)
                $messages[] = array('type' => 'warning', 'message' => $countUpdated.' записей обновлено.');
            if ($countNoChange)
                $messages[] = array('type' => 'warning', 'message' => $countNoChange.' записей без изменений.');
            if ($countInserted)
                $messages[] = array('type' => 'message', 'message' => $countInserted.' записей добавлено.');
            
            
            // Generate report file
            $reportFilename = 'client-prices-import-report.xls';
            $reportFilepath = LOGS_DIR_PATH.$reportFilename;
            if (file_exists($reportFilepath) and !@unlink($reportFilepath))
                $messages[] = array('type' => 'warning', 'message' => 'Failed to create report file.');
            else
            {
                $this->exportToXls($reportFilepath, array('Код', 'Цена', 'РЕЗУЛЬТАТ'), $records);
                $messages[] = array('type' => 'message', 'message' => '<a href="'.LOGS_DIR_URL.$reportFilename.'">Отчет.</a>');
            }
            
            
            $this->data['messages'] = $messages;
        }
    }

?>