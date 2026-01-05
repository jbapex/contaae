import React, { useState, useRef } from 'react';
    import Papa from 'papaparse';
    import { UploadCloud, FileText, Download, Loader2 } from 'lucide-react';
    import { Button } from '@/components/ui/button';
    import { useToast } from '@/components/ui/use-toast';
    import { lancamentoService } from '@/lib/services/lancamentoService';
    import MapeamentoColunasLancamentosDialog from '@/components/configuracoes/MapeamentoColunasLancamentosDialog';

    const ImportacaoMassa = ({ setOpen, onImportSuccess }) => {
      const [file, setFile] = useState(null);
      const [isProcessing, setIsProcessing] = useState(false);
      const [isMappingOpen, setIsMappingOpen] = useState(false);
      const [csvData, setCsvData] = useState({ headers: [], data: [] });
      const { toast } = useToast();
      const fileInputRef = useRef(null);

      const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && (selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv'))) {
          parseCsv(selectedFile);
        } else {
          toast({
            title: "Arquivo inválido",
            description: "Por favor, selecione um arquivo .csv",
            variant: "destructive",
          });
        }
      };

      const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile && (droppedFile.type === 'text/csv' || droppedFile.name.endsWith('.csv'))) {
          parseCsv(droppedFile);
        } else {
          toast({
            title: "Arquivo inválido",
            description: "Por favor, solte um arquivo .csv",
            variant: "destructive",
          });
        }
      };
      
      const parseCsv = (fileToParse) => {
        setFile(fileToParse);
        Papa.parse(fileToParse, {
            header: true,
            skipEmptyLines: true,
            transformHeader: header => header.trim(),
            complete: (results) => {
                if (results.data && results.meta.fields) {
                    setCsvData({ headers: results.meta.fields, data: results.data });
                    setIsMappingOpen(true);
                } else {
                    toast({ title: 'Erro no Arquivo', description: 'Não foi possível processar o arquivo CSV. Verifique o formato.', variant: 'destructive' });
                }
            },
            error: (error) => {
                toast({ title: 'Erro no Parsing', description: `Não foi possível ler o arquivo CSV: ${error.message}`, variant: 'destructive' });
            }
        });
        if(fileInputRef.current) fileInputRef.current.value = "";
      }

      const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
      };

      const handleDownloadTemplate = () => {
        const templateData = [
          {
            data: '2025-07-25',
            descricao: 'Desenvolvimento de Website',
            valor: '2500.50',
            tipo: 'entrada',
            categoria: 'VENDAS',
            cliente: 'Keslen'
          },
          {
            data: '26/07/2025',
            descricao: 'Pagamento de Salário',
            valor: '1500,00',
            tipo: 'saida',
            categoria: 'SALÁRIOS',
            cliente: ''
          },
        ];

        const csv = Papa.unparse(templateData);
        const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
          const url = URL.createObjectURL(blob);
          link.setAttribute('href', url);
          link.setAttribute('download', 'modelo_importacao_jb_apex.csv');
          link.style.visibility = 'hidden';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      };
      
      const handleMappingConfirm = async (mapping) => {
        setIsProcessing(true);
        try {
            const result = await lancamentoService.importLancamentosMassa(csvData.data, mapping);
            
            if (result.successCount > 0) {
              toast({
                title: "Importação Concluída!",
                description: `${result.successCount} de ${csvData.data.length} lançamentos importados com sucesso.`,
                className: "bg-emerald-500 text-white",
              });
              onImportSuccess();
            }

            if (result.errorCount > 0) {
              toast({
                title: "Atenção: Algumas linhas falharam",
                description: `${result.errorCount} linhas não puderam ser importadas.`,
                variant: "destructive",
              });
            }

            setOpen(false); // Close the main dialog
            return true; // To close the mapping dialog
        } catch (error) {
            toast({
                title: "Erro na Importação",
                description: error.message,
                variant: "destructive",
            });
            return false;
        } finally {
            setIsProcessing(false);
        }
      };

      return (
        <div className="space-y-6">
          <MapeamentoColunasLancamentosDialog
            open={isMappingOpen}
            setOpen={setIsMappingOpen}
            csvHeaders={csvData.headers}
            csvData={csvData.data}
            onConfirm={handleMappingConfirm}
          />

          <div>
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-lg">Instruções</h3>
              <Button variant="outline" size="sm" onClick={handleDownloadTemplate}>
                <Download className="w-4 h-4 mr-2" />
                Baixar Modelo
              </Button>
            </div>
            <ul className="text-sm text-gray-400 mt-2 list-disc list-inside space-y-1">
              <li>Seu arquivo CSV deve conter as colunas: `data`, `descricao`, `valor`, `tipo`.</li>
              <li>Colunas `categoria` e `cliente` são opcionais.</li>
              <li>A coluna `data` pode estar em formatos como <strong>AAAA-MM-DD</strong> ou <strong>DD/MM/AAAA</strong>.</li>
              <li>A coluna `tipo` deve ser 'entrada' ou 'saida'.</li>
            </ul>
          </div>

          <div 
            className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-600 rounded-lg text-center cursor-pointer hover:border-fuchsia-400/50 transition-colors bg-black/20"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
          >
            <UploadCloud className="w-12 h-12 text-gray-500 mb-4" />
            {file ? (
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-emerald-500" />
                <span className="font-semibold text-white">{file.name}</span>
              </div>
            ) : (
              <div>
                <p className="font-semibold text-white">Arraste e solte seu arquivo .csv aqui</p>
                <p className="text-sm text-gray-400">ou clique para selecionar</p>
              </div>
            )}
            <input
              id="file-upload"
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={handleFileChange}
              disabled={isProcessing}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isProcessing}>
              Cancelar
            </Button>
            <Button disabled={true} className="gradient-bg">
                {isProcessing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processando...</> : 'Importar Lançamentos'}
            </Button>
          </div>
        </div>
      );
    };

    export default ImportacaoMassa;