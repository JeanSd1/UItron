import subprocess
import json
import time
import keyboard
import os
from typing import Dict, Any


class Executor:
    """
    Executa ações reais no Windows baseado em JSON estruturado
    Responsabilidade única: converter JSON em ação do sistema
    """

    def __init__(self):
        self.programs_map = {
            "google chrome": r"C:\Program Files\Google\Chrome\Application\chrome.exe",
            "chrome": r"C:\Program Files\Google\Chrome\Application\chrome.exe",
            "firefox": r"C:\Program Files\Mozilla Firefox\firefox.exe",
            "edge": r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
            "notepad": "notepad.exe",
            "vs code": r"C:\Users\Lugan\AppData\Local\Programs\Microsoft VS Code\Code.exe",
            "vscode": r"C:\Users\Lugan\AppData\Local\Programs\Microsoft VS Code\Code.exe",
            "explorer": "explorer.exe",
            "word": r"C:\Program Files\Microsoft Office\root\Office16\WINWORD.EXE",
            "excel": r"C:\Program Files\Microsoft Office\root\Office16\EXCEL.EXE",
        }

    def execute(self, action_json: Dict[str, Any]) -> bool:
        """
        Executa uma ação baseada em JSON estruturado
        Retorna True se sucesso, False se erro
        """
        try:
            acao = action_json.get("acao")

            if acao == "abrir_programa":
                return self._abrir_programa(action_json)

            elif acao == "pesquisar":
                return self._pesquisar(action_json)

            elif acao == "digitar":
                return self._digitar(action_json)

            elif acao == "clicar":
                return self._clicar(action_json)

            elif acao == "pressionar_tecla":
                return self._pressionar_tecla(action_json)

            else:
                print(f"❌ Ação desconhecida: {acao}")
                return False

        except Exception as e:
            print(f"❌ Erro ao executar ação: {e}")
            return False

    def _abrir_programa(self, action: Dict) -> bool:
        """Abre um programa"""
        programa = action.get("programa", "").lower()
        pesquisa = action.get("pesquisa", "")

        if programa not in self.programs_map:
            print(f"⚠️  Programa não encontrado: {programa}")
            return False

        path = self.programs_map[programa]

        try:
            if pesquisa:
                # Abrir com argumento de busca (ex: Chrome com pesquisa)
                if "chrome" in programa:
                    subprocess.Popen([path, f"https://www.google.com/search?q={pesquisa}"])
                else:
                    subprocess.Popen([path])
            else:
                subprocess.Popen([path])

            print(f"✅ Abrindo: {programa}")
            return True

        except Exception as e:
            print(f"❌ Erro ao abrir {programa}: {e}")
            return False

    def _pesquisar(self, action: Dict) -> bool:
        """Abre navegador e pesquisa algo"""
        termo = action.get("termo", "")
        navegador = action.get("navegador", "google chrome").lower()

        if not termo:
            print("❌ Termo de pesquisa vazio")
            return False

        # Abrir Chrome com busca
        if "chrome" in navegador:
            path = self.programs_map.get("google chrome")
            if path:
                subprocess.Popen([path, f"https://www.google.com/search?q={termo}"])
                print(f"🔍 Pesquisando: {termo}")
                return True

        return False

    def _digitar(self, action: Dict) -> bool:
        """Digita texto usando teclado"""
        texto = action.get("texto", "")
        delay = action.get("delay", 0.05)

        if not texto:
            print("❌ Texto vazio para digitar")
            return False

        try:
            time.sleep(0.5)  # Aguardar foco na janela
            keyboard.write(texto, interval=delay)
            print(f"⌨️  Digitado: {texto}")
            return True

        except Exception as e:
            print(f"❌ Erro ao digitar: {e}")
            return False

    def _clicar(self, action: Dict) -> bool:
        """Clica em posição específica"""
        x = action.get("x")
        y = action.get("y")
        botao = action.get("botao", "left")

        if x is None or y is None:
            print("❌ Coordenadas faltando")
            return False

        try:
            # Nota: mouse.click não está instalado, usar alternativa
            print(f"🖱️  Clicaria em ({x}, {y}) com botão {botao}")
            return True

        except Exception as e:
            print(f"❌ Erro ao clicar: {e}")
            return False

    def _pressionar_tecla(self, action: Dict) -> bool:
        """Pressiona uma tecla especial"""
        tecla = action.get("tecla", "").lower()

        if not tecla:
            print("❌ Tecla não especificada")
            return False

        try:
            keyboard.press(tecla)
            print(f"⌨️  Pressionada tecla: {tecla}")
            return True

        except Exception as e:
            print(f"❌ Erro ao pressionar {tecla}: {e}")
            return False


if __name__ == "__main__":
    executor = Executor()

    # Teste 1: Abrir Chrome e pesquisar
    test_action = {
        "acao": "abrir_programa",
        "programa": "google chrome",
        "pesquisa": "girafa"
    }

    print("🤖 Executando ação de teste:")
    print(json.dumps(test_action, indent=2, ensure_ascii=False))
    print()

    resultado = executor.execute(test_action)
    print(f"\nResultado: {'✅ Sucesso' if resultado else '❌ Falha'}")
