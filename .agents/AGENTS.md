# Configuración permanente del proyecto (Diseño, UX, Calidad Visual)

Este proyecto utiliza un flujo de trabajo centrado en diseño, UX y calidad visual.
El objetivo es producir interfaces de calidad profesional, evitando completamente los patrones típicos de páginas generadas por IA. Cada decisión de diseño debe estar fundamentada en criterios de UX, UI, branding, composición, accesibilidad, rendimiento y dirección artística. **Prioriza calidad sobre velocidad de desarrollo.**

## Skills Activas (Mandatorias)
Estas directrices deben utilizarse durante TODO el ciclo de desarrollo en cada modificación del frontend:

1. **pbakaus/impeccable**: Usar para Diseño UI, UX, Jerarquía visual, Espaciado, Tipografía, Sistemas de color, Componentes, Responsive, Refinamiento visual, Auditoría del diseño.
2. **emilkowalski/skill**: Usar para Motion Design, Microinteracciones, Scroll Animations, Reveal Animations, Hover Effects, Transiciones, Sensación premium, Fluidez.
3. **taste-skill**: Usar para evitar diseños genéricos, variar composiciones, tomar mejores decisiones estéticas, mejorar el lenguaje visual, aumentar la personalidad del sitio, detectar patrones repetitivos.
4. **animate-skill**: Usar para Animaciones avanzadas, Timing, Stagger, Easing, Transiciones, Motion refinado.
5. **web-design-guidelines**: Usar para validar constantemente buenas prácticas, accesibilidad, UX, consistencia, responsive, legibilidad, claridad.
6. **ui-ux-pro-max-cli**: Utilizar para mejorar la experiencia de usuario, refinar componentes, revisar consistencia, optimizar el diseño antes de finalizar cualquier tarea.

## Playwright (Flujo de Pruebas Visuales)
Si Playwright no está configurado, configúralo. Después de cada cambio importante del frontend:
1. Ejecuta Playwright.
2. Inspecciona visualmente la interfaz (abre la app o haz capturas).
3. Detecta errores.
4. Corrige automáticamente el código.
5. Repite hasta que no existan problemas.

## Revisiones Obligatorias
Después de cada implementación, verifica:
- Responsive, Overflow horizontal, Scroll, Padding, Margins, Tipografía, Espaciado, Alineación.
- Jerarquía visual, Contraste, Estados Hover, Estados Focus.
- Accesibilidad, Rendimiento, CLS, LCP, Animaciones, Consistencia visual.

## Filosofía de Diseño
- **Nunca utilices diseños genéricos.**
- Evita: Hero estándar, tres tarjetas idénticas, secciones repetidas, layouts comunes, componentes sin personalidad, patrones fácilmente reconocibles de IA.
- Cada sección debe sentirse única, cada componente debe tener intención y cada animación debe aportar valor.

## Autoevaluación antes de finalizar cualquier tarea
Pregúntate:
- ¿Parece una plantilla o generado por IA?
- ¿Tiene personalidad y una jerarquía visual clara?
- ¿El diseño transmite calidad profesional?
- ¿Las animaciones mejoran la experiencia y no hay inconsistencias visuales?
Si alguna respuesta es negativa, continúa refinando el proyecto antes de dar la tarea por terminada.
