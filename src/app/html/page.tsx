"use client";

import HTMLEditor from "@/src/components/html-editor/HTMLEditor";

export default function Home() {
  const html = `<!DOCTYPE html><html lang="fr"><head>
<meta charset="utf-8">
<meta content="width=device-width, initial-scale=1.0" name="viewport">
<title>Visuels et Couleurs</title>

<link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" rel="stylesheet">
<script src="https://d3js.org/d3.v7.min.js"></script>
<script src="https://cdn.tailwindcss.com"></script><style>
        body {width: 1280px; min-height: 736px; overflow: hidden; margin: 0;
            padding: 0;}
        .slide {
            width: 1280px;
            min-height: 736px;
        }
        .color-swatch {
            width: 100%;
            height: 40px;
            border-radius: 6px;
            margin-bottom: 4px;
        }
        .section-card {
            background-color: rgba(255, 255, 255, 0.9);
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }
    
html {
    overflow: hidden;
}</style>
<style>*, ::before, ::after{--tw-border-spacing-x:0;--tw-border-spacing-y:0;--tw-translate-x:0;--tw-translate-y:0;--tw-rotate:0;--tw-skew-x:0;--tw-skew-y:0;--tw-scale-x:1;--tw-scale-y:1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness:proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width:0px;--tw-ring-offset-color:#fff;--tw-ring-color:rgb(59 130 246 / 0.5);--tw-ring-offset-shadow:0 0 #0000;--tw-ring-shadow:0 0 #0000;--tw-shadow:0 0 #0000;--tw-shadow-colored:0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }::backdrop{--tw-border-spacing-x:0;--tw-border-spacing-y:0;--tw-translate-x:0;--tw-translate-y:0;--tw-rotate:0;--tw-skew-x:0;--tw-skew-y:0;--tw-scale-x:1;--tw-scale-y:1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness:proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width:0px;--tw-ring-offset-color:#fff;--tw-ring-color:rgb(59 130 246 / 0.5);--tw-ring-offset-shadow:0 0 #0000;--tw-ring-shadow:0 0 #0000;--tw-shadow:0 0 #0000;--tw-shadow-colored:0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }/* ! tailwindcss v3.4.17 | MIT License | https://tailwindcss.com */*,::after,::before{box-sizing:border-box;border-width:0;border-style:solid;border-color:#e5e7eb}::after,::before{--tw-content:''}:host,html{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;tab-size:4;font-family:ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";font-feature-settings:normal;font-variation-settings:normal;-webkit-tap-highlight-color:transparent}body{margin:0;line-height:inherit}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){-webkit-text-decoration:underline dotted;text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,pre,samp{font-family:ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;font-feature-settings:normal;font-variation-settings:normal;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}button,input,optgroup,select,textarea{font-family:inherit;font-feature-settings:inherit;font-variation-settings:inherit;font-size:100%;font-weight:inherit;line-height:inherit;letter-spacing:inherit;color:inherit;margin:0;padding:0}button,select{text-transform:none}button,input:where([type=button]),input:where([type=reset]),input:where([type=submit]){-webkit-appearance:button;background-color:transparent;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dd,dl,figure,h1,h2,h3,h4,h5,h6,hr,p,pre{margin:0}fieldset{margin:0;padding:0}legend{padding:0}menu,ol,ul{list-style:none;margin:0;padding:0}dialog{padding:0}textarea{resize:vertical}input::placeholder,textarea::placeholder{opacity:1;color:#9ca3af}[role=button],button{cursor:pointer}:disabled{cursor:default}audio,canvas,embed,iframe,img,object,svg,video{display:block;vertical-align:middle}img,video{max-width:100%;height:auto}[hidden]:where(:not([hidden=until-found])){display:none}.mb-2{margin-bottom:0.5rem}.mb-3{margin-bottom:0.75rem}.mb-4{margin-bottom:1rem}.mb-6{margin-bottom:1.5rem}.mb-8{margin-bottom:2rem}.mr-2{margin-right:0.5rem}.mr-4{margin-right:1rem}.mt-1{margin-top:0.25rem}.mt-6{margin-top:1.5rem}.mt-8{margin-top:2rem}.flex{display:flex}.grid{display:grid}.h-1{height:0.25rem}.h-10{height:2.5rem}.h-12{height:3rem}.h-16{height:4rem}.h-48{height:12rem}.w-10{width:2.5rem}.w-12{width:3rem}.w-16{width:4rem}.w-24{width:6rem}.flex-grow{flex-grow:1}.grid-cols-2{grid-template-columns:repeat(2, minmax(0, 1fr))}.flex-col{flex-direction:column}.items-start{align-items:flex-start}.items-center{align-items:center}.justify-center{justify-content:center}.justify-between{justify-content:space-between}.gap-4{gap:1rem}.gap-8{gap:2rem}.gap-x-4{column-gap:1rem}.gap-y-3{row-gap:0.75rem}.space-x-3 > :not([hidden]) ~ :not([hidden]){--tw-space-x-reverse:0;margin-right:calc(0.75rem * var(--tw-space-x-reverse));margin-left:calc(0.75rem * calc(1 - var(--tw-space-x-reverse)))}.rounded-full{border-radius:9999px}.rounded-lg{border-radius:0.5rem}.border-2{border-width:2px}.border-blue-600{--tw-border-opacity:1;border-color:rgb(37 99 235 / var(--tw-border-opacity, 1))}.bg-blue-100{--tw-bg-opacity:1;background-color:rgb(219 234 254 / var(--tw-bg-opacity, 1))}.bg-blue-600{--tw-bg-opacity:1;background-color:rgb(37 99 235 / var(--tw-bg-opacity, 1))}.bg-green-100{--tw-bg-opacity:1;background-color:rgb(220 252 231 / var(--tw-bg-opacity, 1))}.bg-yellow-500{--tw-bg-opacity:1;background-color:rgb(234 179 8 / var(--tw-bg-opacity, 1))}.bg-gradient-to-br{background-image:linear-gradient(to bottom right, var(--tw-gradient-stops))}.from-gray-50{--tw-gradient-from:#f9fafb var(--tw-gradient-from-position);--tw-gradient-to:rgb(249 250 251 / 0) var(--tw-gradient-to-position);--tw-gradient-stops:var(--tw-gradient-from), var(--tw-gradient-to)}.to-gray-100{--tw-gradient-to:#f3f4f6 var(--tw-gradient-to-position)}.p-12{padding:3rem}.p-6{padding:1.5rem}.text-2xl{font-size:1.5rem;line-height:2rem}.text-4xl{font-size:2.25rem;line-height:2.5rem}.text-lg{font-size:1.125rem;line-height:1.75rem}.text-sm{font-size:0.875rem;line-height:1.25rem}.text-xl{font-size:1.25rem;line-height:1.75rem}.text-xs{font-size:0.75rem;line-height:1rem}.font-bold{font-weight:700}.font-medium{font-weight:500}.font-semibold{font-weight:600}.text-blue-600{--tw-text-opacity:1;color:rgb(37 99 235 / var(--tw-text-opacity, 1))}.text-gray-400{--tw-text-opacity:1;color:rgb(156 163 175 / var(--tw-text-opacity, 1))}.text-gray-500{--tw-text-opacity:1;color:rgb(107 114 128 / var(--tw-text-opacity, 1))}.text-gray-600{--tw-text-opacity:1;color:rgb(75 85 99 / var(--tw-text-opacity, 1))}.text-gray-700{--tw-text-opacity:1;color:rgb(55 65 81 / var(--tw-text-opacity, 1))}.text-gray-800{--tw-text-opacity:1;color:rgb(31 41 55 / var(--tw-text-opacity, 1))}.text-green-500{--tw-text-opacity:1;color:rgb(34 197 94 / var(--tw-text-opacity, 1))}.text-green-600{--tw-text-opacity:1;color:rgb(22 163 74 / var(--tw-text-opacity, 1))}.text-red-500{--tw-text-opacity:1;color:rgb(239 68 68 / var(--tw-text-opacity, 1))}.text-white{--tw-text-opacity:1;color:rgb(255 255 255 / var(--tw-text-opacity, 1))}</style></head>
<body class="">
<div class="slide bg-gradient-to-br from-gray-50 to-gray-100 p-12 flex flex-col" style=" overflow: hidden;">
<!-- Header -->
<div class="mb-8">
<h1 class="text-4xl font-bold text-gray-800 mb-2">Visuels et Couleurs</h1>
<div class="w-24 h-1 bg-blue-600"></div>
</div>
<!-- Main Content - 2 columns layout -->
<div class="flex-grow grid grid-cols-2 gap-8">
<!-- 60-30-10 Rule Section -->
<div class="section-card p-6">
<div class="flex items-center mb-4">
<div class="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
<i class="fas fa-palette text-2xl text-blue-600"></i>
</div>
<h2 class="text-2xl font-semibold text-gray-700">La Règle du 60-30-10</h2>
</div>
<!-- Rule Visualization -->
<div class="mb-6 h-48" id="color-rule-chart"></div>
<!-- Color Palette Examples -->
<h3 class="text-lg font-medium text-gray-700 mb-3">Exemples de Palettes</h3>
<div class="grid grid-cols-2 gap-4">
<div>
<div class="color-swatch" style="background-color: #06436e;"></div>
<p class="text-xs text-gray-600">Bleu Marine (60%)</p>
</div>
<div>
<div class="color-swatch" style="background-color: #f49415;"></div>
<p class="text-xs text-gray-600">Orange (30%)</p>
</div>
<div>
<div class="color-swatch" style="background-color: #4B5A5F;"></div>
<p class="text-xs text-gray-600">Gris (60%)</p>
</div>
<div>
<div class="color-swatch" style="background-color: #FBE969;"></div>
<p class="text-xs text-gray-600">Jaune (30%)</p>
</div>
</div>
</div>
<!-- Images and Icons Section -->
<div class="section-card p-6">
<div class="flex items-center mb-4">
<div class="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mr-4">
<i class="fas fa-images text-2xl text-green-600"></i>
</div>
<h2 class="text-2xl font-semibold text-gray-700">Images et Icônes</h2>
</div>
<p class="text-gray-600 mb-4">Les visuels doivent servir à renforcer votre message, et non à le décorer</p>
<div class="grid grid-cols-2 gap-x-4 gap-y-3">
<div class="flex items-start">
<i class="fas fa-check-circle text-green-500 mt-1 mr-2"></i>
<p class="text-sm text-gray-600"><strong>Icônes:</strong> Communiquent plus vite que le texte et mémorisées 55% mieux</p>
</div>
<div class="flex items-start">
<i class="fas fa-check-circle text-green-500 mt-1 mr-2"></i>
<p class="text-sm text-gray-600"><strong>Qualité:</strong> Utilisez des images naturelles et authentiques</p>
</div>
<div class="flex items-start">
<i class="fas fa-check-circle text-green-500 mt-1 mr-2"></i>
<p class="text-sm text-gray-600"><strong>Quantité:</strong> Une seule image de soutien par diapositive</p>
</div>
<div class="flex items-start">
<i class="fas fa-check-circle text-green-500 mt-1 mr-2"></i>
<p class="text-sm text-gray-600"><strong>Cohérence:</strong> Taille et placement cohérents sur toutes les slides</p>
</div>
<div class="flex items-start">
<i class="fas fa-check-circle text-green-500 mt-1 mr-2"></i>
<p class="text-sm text-gray-600"><strong>Contraste:</strong> Assurez un contraste élevé pour la lisibilité</p>
</div>
<div class="flex items-start">
<i class="fas fa-times-circle text-red-500 mt-1 mr-2"></i>
<p class="text-sm text-gray-600"><strong>Éviter:</strong> Les GIF animés sauf si leur objectif est clair</p>
</div>
</div>
<!-- Visual Example -->
<div class="mt-6 flex items-center justify-center">
<div class="flex items-center space-x-3">
<div class="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white">
<i class="fas fa-lightbulb"></i>
</div>
<i class="fas fa-plus text-gray-400"></i>
<div class="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center text-white">
<i class="fas fa-comment"></i>
</div>
<i class="fas fa-equals text-gray-400"></i>
<div class="w-16 h-16 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 border-2 border-blue-600">
<i class="fas fa-lightbulb text-xl"></i>
</div>
</div>
</div>
</div>
</div>
<!-- Footer -->
<div class="mt-8 flex justify-between items-center text-gray-500 text-sm">
<div>L'Art des Diapositives Simples et Efficaces</div>
<div style="visibility: hidden;">4 / 5</div>
</div>
</div>
<script>
        // D3.js visualization for the 60-30-10 rule
        document.addEventListener('DOMContentLoaded', function() {
            const data = [
                { category: "Principale", percentage: 60, color: "#06436e" },
                { category: "Secondaire", percentage: 30, color: "#f49415" },
                { category: "Accent", percentage: 10, color: "#ffffff" }
            ];
            
            const width = document.getElementById('color-rule-chart').clientWidth;
            const height = document.getElementById('color-rule-chart').clientHeight;
            
            const svg = d3.select("#color-rule-chart")
                .append("svg")
                .attr("width", width)
                .attr("height", height)
                .append("g");
            
            // Calculate positions
            let xPosition = 0;
            data.forEach(d => {
                const rectWidth = (width * d.percentage) / 100;
                
                // Add rectangle
                svg.append("rect")
                    .attr("x", xPosition)
                    .attr("y", 0)
                    .attr("width", rectWidth)
                    .attr("height", height * 0.7)
                    .attr("fill", d.color)
                    .attr("stroke", "#e2e8f0")
                    .attr("stroke-width", 1)
                    .attr("rx", 4);
                
                // Add text
                svg.append("text")
                    .attr("x", xPosition + (rectWidth / 2))
                    .attr("y", height * 0.85)
                    .attr("text-anchor", "middle")
                    .attr("fill", "#4a5568")
                    .attr("font-size", "14px")
                    .text(d.category + " " + d.percentage + "%");
                
                xPosition += rectWidth;
            });
        });
    </script>

</body></html>`;
  return (
    <div className="min-h-screen bg-gray-200 flex items-center justify-center p-4">
      <HTMLEditor initialHtml={html} />
    </div>
  );
}
