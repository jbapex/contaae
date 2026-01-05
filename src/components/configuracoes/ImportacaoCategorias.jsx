import React, { useState } from 'react';
import Papa from 'papaparse';
import { UploadCloud, FileText, CheckCircle, XCircle, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { categoriaService } from '@/lib/services/categoriaService';

const ImportacaoCategorias = ({ setOpen, onImportSuccess }) => {
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const { toast } = useToast();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && (selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv'))) {
      setFile(selectedFile);
      setImportResult(null);
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
      setFile(droppedFile);
      setImportResult(null);
    } else {
      toast({
        title: "Arquivo inválido",
        description: "Por favor, solte um arquivo .csv",
        variant: "destructive",
      });
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDownloadTemplate = () => {
    const templateData = [
      { nome: 'Vendas de Produtos', tipo: 'entrada' },
      { nome: 'Consultoria', tipo: 'entrada' },
      { nome: 'Aluguel', tipo: 'saida' },
      { nome: 'Marketing', tipo: 'saida' },
    ];

    const csv = Papa.unparse(templateData);
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'modelo_importacao_categorias.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const processImport = () => {
    if (!file) {
      toast({
        title: "Nenhum arquivo selecionado",
        description: "Por favor, selecione um arquivo para importar.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setImportResult(null);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: header => header.trim().toLowerCase(),
      complete: async (results) => {
        const { data, errors } = results;
        
        if (errors.length > 0) {
          toast({
            title: "Erro ao processar o arquivo",
            description: `Encontrados ${errors.length} erros. Verifique o formato do seu CSV.`,
            variant: "destructive",
          });
          setIsProcessing(false);
          return;
        }

        const categoriasParaImportar = data.map(row => ({
          nome: row.nome,
          tipo: row.tipo?.toLowerCase().trim(),
        })).filter(cat => cat.nome && cat.tipo && ['entrada', 'saida'].includes(cat.tipo));

        if (categoriasParaImportar.length === 0) {
          toast({
            title: "Nenhuma categoria válida encontrada",
            description: "Verifique se seu arquivo tem as colunas 'nome' e 'tipo' ('entrada' ou 'saida') preenchidas corretamente.",
            variant: "destructive",
          });
          setIsProcessing(false);
          return;
        }

        try {
          const { successCount, errorCount, errorDetails } = await categoriaService.saveCategoriasEmMassa(categoriasParaImportar);
          
          setImportResult({ successCount, errorCount, errorDetails });
          
          if (successCount > 0) {
            onImportSuccess();
            toast({
              title: "Importação concluída!",
              description: `${successCount} categorias importadas com sucesso.`,
              className: "bg-emerald-500 text-white",
            });
          }
          
          if (errorCount > 0) {
            toast({
              title: "Atenção: Algumas categorias falharam",
              description: `${errorCount} categorias não puderam ser importadas.`,
              variant: "destructive",
            });
          }
        } catch (err) {
          toast({
            title: "Erro na importação",
            description: err.message,
            variant: "destructive",
          });
        } finally {
          setIsProcessing(false);
        }
      },
      error: (err) => {
        toast({
          title: "Erro fatal na leitura",
          description: `Não foi possível ler o arquivo: ${err.message}`,
          variant: "destructive",
        });
        setIsProcessing(false);
      }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-lg">Instruções</h3>
          <Button variant="outline" size="sm" onClick={handleDownloadTemplate}>
            <Download className="w-4 h-4 mr-2" />
            Baixar Modelo
          </Button>
        </div>
        <ul className="text-sm text-gray-400 mt-2 list-disc list-inside space-y-1">
          <li>Seu arquivo CSV deve conter as colunas: `nome` e `tipo`.</li>
          <li>A coluna `tipo` deve ser 'entrada' ou 'saida'.</li>
          <li>Categorias com nomes já existentes para o mesmo tipo serão ignoradas.</li>
        </ul>
      </div>

      <div 
        className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-600 rounded-lg text-center cursor-pointer hover:border-fuchsia-400/50 transition-colors bg-black/20"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => document.getElementById('categoria-file-upload').click()}
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
          id="categoria-file-upload"
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={handleFileChange}
          disabled={isProcessing}
        />
      </div>

      {importResult && (
        <div className="p-4 rounded-lg bg-white/5">
          <h4 className="font-semibold mb-2">Resultado da Importação</h4>
          <div className="flex items-center space-x-2 text-emerald-400">
            <CheckCircle className="w-5 h-5" />
            <span>{importResult.successCount} categorias importadas com sucesso.</span>
          </div>
          {importResult.errorCount > 0 && (
            <div className="flex items-start space-x-2 text-red-400 mt-2">
              <XCircle className="w-5 h-5 mt-1 flex-shrink-0" />
              <div>
                <span>{importResult.errorCount} categorias com erros (provavelmente já existem).</span>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isProcessing}>
          {importResult ? 'Fechar' : 'Cancelar'}
        </Button>
        <Button onClick={processImport} disabled={isProcessing || !file} className="gradient-bg">
          {isProcessing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processando...</> : 'Importar Categorias'}
        </Button>
      </div>
    </div>
  );
};

export default ImportacaoCategorias;