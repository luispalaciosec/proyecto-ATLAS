---
id: ATLAS-INTELLIGENCE-100
title: Intelligence Public API
status: approved
version: 1.0.0
owner: Atlas Architecture
category: Intelligence
layer: Specification
created: 2026-07-20
updated: 2026-07-20

depends_on:
  - ATLAS-INTELLIGENCE-011
---

# Intelligence Public API

---

# 1. Purpose

Este documento define la superficie pública de la Intelligence Layer.

Su propósito consiste en establecer el contrato estable que consumen:

- aplicaciones;
- plugins;
- agentes;
- SDKs;
- herramientas externas.

Todo aquello que no aparezca documentado aquí deberá considerarse interno.

---

# 2. Design Philosophy

La Intelligence Layer debe comportarse como una plataforma.

Los consumidores no necesitan conocer:

- cómo funciona Memory;
- cómo funciona Retrieval;
- cómo funciona Planning;
- cómo funciona Reasoning.

Únicamente necesitan expresar objetivos.

La plataforma decidirá cómo resolverlos.

---

# 3. Public Entry Point

Toda interacción con la Intelligence Layer comienza desde un único punto.

Conceptualmente:

```

atlas.intelligence

```

No existen múltiples puntos de entrada.

No existen accesos directos a componentes internos.

Toda operación comienza desde esta interfaz.

---

# 4. Public Surface

La API pública representa capacidades.

No representa implementaciones.

Ejemplos conceptuales:

- execute()
- analyze()
- plan()
- retrieve()
- remember()
- recall()
- delegate()
- explain()

Cada operación constituye una intención de alto nivel.

Nunca una implementación concreta.

---

# 5. Stable Contracts

La Public API deberá mantenerse estable entre versiones mayores.

Las implementaciones internas podrán cambiar libremente.

Por ejemplo:

Memory podrá utilizar:

- vector databases;
- knowledge graphs;
- bases relacionales;
- archivos;
- caches.

Sin modificar la API pública.

La estabilidad constituye un principio arquitectónico obligatorio.

---

# 6. Internal Separation

La API pública nunca expone:

- workflows internos;
- prompts;
- modelos fundacionales;
- proveedores de IA;
- estructuras internas de memoria;
- algoritmos de razonamiento.

Todos estos componentes permanecen encapsulados detrás del Intelligence Engine.

# 7. Extension Model

Atlas deberá permitir ampliar la Intelligence Layer sin modificar el núcleo.

Las extensiones podrán incorporar:

- nuevos proveedores de memoria;
- motores de razonamiento;
- estrategias de planificación;
- motores de workflow;
- nuevos agentes;
- políticas de gobernanza.

Siempre mediante contratos públicos.

Nunca mediante modificaciones directas del Engine.

---

# 8. Versioning Policy

Toda modificación de la Public API deberá respetar Semantic Versioning.

Cambios permitidos en versiones menores:

- nuevas operaciones;
- nuevos parámetros opcionales;
- nuevos contratos compatibles.

Cambios incompatibles requerirán una nueva versión mayor.

---

# 9. Compatibility

Toda implementación oficial deberá respetar esta API.

Asimismo, cualquier implementación desarrollada por terceros podrá sustituir componentes internos siempre que preserve los contratos públicos.

Este principio garantiza la interoperabilidad del ecosistema Atlas.

---

# 10. Relationship with the SDK

El SDK constituye la puerta de entrada para los desarrolladores.

Internamente, el SDK delega en la Public API de la Intelligence Layer.

Las aplicaciones nunca interactúan directamente con componentes internos como:

- Memory;
- Retrieval;
- Reasoning;
- Planning.

Toda comunicación se realiza a través del SDK y de la Public API.

---

# 11. Relationship with Contracts

Este documento define QUÉ capacidades expone Atlas.

Los documentos de Contracts definirán CÓMO deben comportarse dichas capacidades.

En consecuencia:

Public API
↓

Contracts
↓

Implementaciones

La API constituye la autoridad superior.

Los contratos nunca podrán contradecirla.

---

# 12. Future Evolution

La Public API evolucionará para incorporar nuevas capacidades cognitivas.

Por ejemplo:

- simulación;
- negociación;
- colaboración entre agentes;
- aprendizaje continuo;
- optimización estratégica;
- coordinación distribuida.

Todas deberán integrarse preservando la estabilidad de la interfaz pública.

---

# 13. Success Criteria

La Public API se considerará correctamente definida cuando:

- exista un único punto de entrada para la Intelligence Layer;
- todas las capacidades públicas estén documentadas;
- los consumidores no dependan de implementaciones internas;
- el SDK pueda construirse completamente sobre esta especificación;
- futuras implementaciones puedan evolucionar sin romper compatibilidad.

Este documento constituye la especificación oficial de la interfaz pública de la Intelligence Layer.