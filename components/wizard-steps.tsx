"use client"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Check, ExternalLink, Code, Palette, FileText, Sparkles } from "lucide-react"
import type { WizardState, WizardActions } from "@/hooks/use-wizard-state"

interface WizardStepsProps {
  wizardState: WizardState
  wizardActions: WizardActions
}

export function WizardSteps({ wizardState, wizardActions }: WizardStepsProps) {
  const { step, figmaUrl, jsx, css, figmaCss, figmaData, loading, error } = wizardState
  const { setFigmaUrl, setJsx, setCss, setFigmaCss } = wizardActions

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6 max-w-lg mx-auto">
            <div className="text-center mb-6">
              <ExternalLink className="w-12 h-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-3">Figma URL megadása</h3>
              <p className="text-gray-400">Add meg a Figma file publikus linkjét a konvertálás megkezdéséhez</p>
            </div>

            <div>
              <Label htmlFor="figma-url" className="text-sm font-semibold text-gray-300 mb-3 block">
                Figma File URL
              </Label>
              <div className="relative">
                <Input
                  id="figma-url"
                  type="text"
                  placeholder="https://www.figma.com/file/..."
                  value={figmaUrl}
                  onChange={(e) => setFigmaUrl(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800/60 border border-gray-700/50 rounded-xl text-white placeholder:text-gray-500 focus:border-gray-600 focus:ring-2 focus:ring-white/10 backdrop-blur-sm"
                />
                {figmaUrl && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Check className="w-5 h-5 text-green-400" />
                  </div>
                )}
              </div>
            </div>

            <div className="bg-blue-900/20 border border-blue-800/30 rounded-xl p-4">
              <p className="text-xs text-blue-300 leading-relaxed">
                <strong>Támogatott formátumok:</strong> Figma file és design linkek. Győződj meg róla, hogy a file
                publikusan elérhető vagy megfelelő jogosultságokkal rendelkezel.
              </p>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6 max-w-2xl mx-auto">
            <div className="text-center mb-6">
              <Code className="w-12 h-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-3">JSX Kód megadása</h3>
              <p className="text-gray-400">Opcionálisan add meg a meglévő React JSX kódot az optimalizáláshoz</p>
            </div>

            <div>
              <Label htmlFor="jsx-code" className="text-sm font-semibold text-gray-300 mb-3 block">
                React JSX Kód (opcionális)
              </Label>
              <Textarea
                id="jsx-code"
                placeholder={`function MyComponent() {
  return (
    <div className="container">
      <h1>Hello World</h1>
    </div>
  );
}`}
                value={jsx}
                onChange={(e) => setJsx(e.target.value)}
                className="w-full h-64 px-4 py-3 bg-gray-800/60 border border-gray-700/50 rounded-xl text-white placeholder:text-gray-500 focus:border-gray-600 focus:ring-2 focus:ring-white/10 backdrop-blur-sm font-mono text-sm"
              />
            </div>

            <div className="bg-purple-900/20 border border-purple-800/30 rounded-xl p-4">
              <p className="text-xs text-purple-300 leading-relaxed">
                <strong>Tipp:</strong> Ha már van JSX kódod, az AI optimalizálni fogja azt a Figma design alapján. Ha
                üresen hagyod, teljesen új kód generálódik.
              </p>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6 max-w-2xl mx-auto">
            <div className="text-center mb-6">
              <Palette className="w-12 h-12 text-pink-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-3">Saját CSS megadása</h3>
              <p className="text-gray-400">Add meg az egyedi CSS stílusokat a testreszabáshoz</p>
            </div>

            <div>
              <Label htmlFor="custom-css" className="text-sm font-semibold text-gray-300 mb-3 block">
                Egyedi CSS Stílusok (opcionális)
              </Label>
              <Textarea
                id="custom-css"
                placeholder={`.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.button {
  background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  color: white;
  font-weight: 600;
}`}
                value={css}
                onChange={(e) => setCss(e.target.value)}
                className="w-full h-64 px-4 py-3 bg-gray-800/60 border border-gray-700/50 rounded-xl text-white placeholder:text-gray-500 focus:border-gray-600 focus:ring-2 focus:ring-white/10 backdrop-blur-sm font-mono text-sm"
              />
            </div>

            <div className="bg-pink-900/20 border border-pink-800/30 rounded-xl p-4">
              <p className="text-xs text-pink-300 leading-relaxed">
                <strong>Használat:</strong> Ezek a stílusok kombinálódnak a Figma-ból generált CSS-sel. Használd egyedi
                animációkhoz, responsive breakpoint-okhoz vagy brand-specifikus stílusokhoz.
              </p>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6 max-w-2xl mx-auto">
            <div className="text-center mb-6">
              <FileText className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-3">Figma CSS megadása</h3>
              <p className="text-gray-400">Illeszd be a Figma-ból exportált CSS kódot</p>
            </div>

            <div>
              <Label htmlFor="figma-css" className="text-sm font-semibold text-gray-300 mb-3 block">
                Figma Exportált CSS (opcionális)
              </Label>
              <Textarea
                id="figma-css"
                placeholder={`/* Figma exportált stílusok */
.frame-1 {
  display: flex;
  width: 375px;
  height: 812px;
  padding: 24px;
  flex-direction: column;
  align-items: flex-start;
  gap: 16px;
  background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
}

.text-style-1 {
  color: #FFF;
  font-family: Inter;
  font-size: 24px;
  font-style: normal;
  font-weight: 700;
  line-height: 32px;
}`}
                value={figmaCss}
                onChange={(e) => setFigmaCss(e.target.value)}
                className="w-full h-64 px-4 py-3 bg-gray-800/60 border border-gray-700/50 rounded-xl text-white placeholder:text-gray-500 focus:border-gray-600 focus:ring-2 focus:ring-white/10 backdrop-blur-sm font-mono text-sm"
              />
            </div>

            <div className="bg-cyan-900/20 border border-cyan-800/30 rounded-xl p-4">
              <p className="text-xs text-cyan-300 leading-relaxed">
                <strong>Figma Export:</strong> A Figma-ban jelöld ki a frame-et, majd válaszd a "Copy as CSS" opciót. Ez
                segít az AI-nak pontosabb konverziót készíteni.
              </p>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6 max-w-2xl mx-auto">
            <div className="text-center mb-6">
              <Sparkles className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-3">Összegzés & Generálás</h3>
              <p className="text-gray-400">Ellenőrizd az adatokat és indítsd el az AI konverziót</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-4">
                <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                  <ExternalLink className="w-4 h-4" />
                  Figma File
                </h4>
                <p className="text-gray-400 text-sm break-all">{figmaUrl || "Nincs megadva"}</p>
                {figmaData && <p className="text-green-400 text-xs mt-1">✅ Sikeresen betöltve: {figmaData.name}</p>}
              </div>

              <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-4">
                <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                  <Code className="w-4 h-4" />
                  JSX Kód
                </h4>
                <p className="text-gray-400 text-sm">{jsx ? `${jsx.length} karakter` : "Nincs megadva"}</p>
              </div>

              <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-4">
                <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  Egyedi CSS
                </h4>
                <p className="text-gray-400 text-sm">{css ? `${css.length} karakter` : "Nincs megadva"}</p>
              </div>

              <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-4">
                <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Figma CSS
                </h4>
                <p className="text-gray-400 text-sm">{figmaCss ? `${figmaCss.length} karakter` : "Nincs megadva"}</p>
              </div>
            </div>

            <div className="bg-yellow-900/20 border border-yellow-800/30 rounded-xl p-4">
              <p className="text-xs text-yellow-300 leading-relaxed">
                <strong>Következő lépés:</strong> Az AI elemezni fogja a Figma designt és optimalizálni fogja a kódot.
                Ez néhány másodpercet vehet igénybe.
              </p>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-[400px] transition-all duration-300">
      {error && (
        <div className="mb-6 p-4 bg-red-900/20 border border-red-800/30 rounded-xl">
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      {loading && (
        <div className="mb-6 p-4 bg-blue-900/20 border border-blue-800/30 rounded-xl">
          <div className="flex items-center space-x-3">
            <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-blue-300 text-sm font-medium">
              {step === 1 ? "Figma file betöltése..." : "Feldolgozás..."}
            </span>
          </div>
        </div>
      )}

      <div
        className={`transition-all duration-300 ${wizardState.stepAnim ? "opacity-50 scale-95" : "opacity-100 scale-100"}`}
      >
        {renderStepContent()}
      </div>
    </div>
  )
}
