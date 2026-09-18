# ATLAS — Inventario de rutas y archivos
- Ruta base: `/Users/luispalacios/ATLAS`
- Generado: 2026-09-15
- Excluidos: `node_modules`, `.git`, `.pnpm-store`, `.turbo`, `dist`, `build`, `.next`, `coverage`
- Total directorios: **326** · Total archivos: **1298**

---
**Salvaguarda:** este inventario debe contener únicamente rutas y tamaños
de archivo. Nunca debe incluirse el contenido de `.env`, `.atlas/`, ni
ningún archivo con credenciales — solo su existencia y tamaño, como aquí.
Si una futura regeneración de este archivo vuelca contenido en vez de
metadata, detente y no comitees hasta redactar los secretos.
---

## Árbol

```
ATLAS/
  .env  (815 B)
  .env.example  (467 B)
  .gitignore  (432 B)
  .npmrc  (74 B)
  .nvmrc  (3 B)
  .prettierignore  (54 B)
  .prettierrc  (127 B)
  ATLAS_ARCHITECTURE_MASTER.md  (36,690 B)
  ATLAS_PRODUCT_VISION_v1.0.md  (12,699 B)
  ATLAS_ROADMAP_RECONCILIATION.md  (8,694 B)
  PILOT_LOG.md  (3,839 B)
  README.md  (10,217 B)
  USER_MANUAL.md  (9,020 B)
  VERSION.md  (47,839 B)
  eslint.config.js  (739 B)
  package.json  (974 B)
  pnpm-lock.yaml  (173,499 B)
  pnpm-workspace.yaml  (90 B)
  tsconfig.base.json  (523 B)
  tsconfig.json  (104 B)
  turbo.json  (332 B)
  .atlas/
    memory.json  (8,562 B)
    workspaces/
      geeks/
        knowledge-folders.json  (67 B)
        memory.json  (351,219 B)
        profile.json  (460 B)
      geeks-banco-amazonas/
        memory.json  (8,055 B)
        profile.json  (184 B)
      verificacion-fix/
        memory.json  (2,067 B)
        profile.json  (204 B)
  .changeset/
    README.md  (269 B)
    config.json  (275 B)
  .github/
    workflows/
      ci.yml  (830 B)
  adr/
    ADR-0001-DOCUMENT_ID_NAMESPACE.md  (4,538 B)
    ADR-0002-PLANNING_CONSOLIDATION.md  (6,842 B)
    ADR-0003-MEMORY_ARCHITECTURE_RESOLUTION.md  (14,919 B)
    ADR-0004-EXECUTION-MODEL-AND-RUNTIME-OWNERSHIP.md  (29,352 B)
    ADR-0005-RETRIEVAL_ARCHITECTURE_RECONCILIATION.md  (33,877 B)
    README.md  (1,938 B)
  apps/
    README.md  (360 B)
    web/
      index.html  (1,058 B)
      package.json  (1,075 B)
      tsconfig.json  (230 B)
      vite.config.ts  (208 B)
      vitest.config.ts  (308 B)
      .atlas/
        workspaces/
          geeks/
            activity.json  (299 B)
            conversation.json  (795 B)
            memory.json  (4,025 B)
            profile.json  (147 B)
          revital/
            conversation.json  (570 B)
            profile.json  (149 B)
      design-system/
        .thumbnail  (4,222 B)
        SKILL.md  (1,054 B)
        _adherence.oxlintrc.json  (20,660 B)
        _ds_bundle.js  (60,314 B)
        _ds_manifest.json  (16,562 B)
        readme.md  (9,077 B)
        styles.css  (147 B)
        thumbnail.html  (936 B)
        assets/
          logo-alt.svg  (2,124 B)
          logo.svg  (2,510 B)
          fonts/
            Inter-Italic-VariableFont_opsz_wght.ttf  (904,532 B)
            Sora-VariableFont_wght.ttf  (110,224 B)
          reference/
            atlas-reference-sheet.png  (1,437,413 B)
            colores-atlas.png  (2,949 B)
        components/
          app/
            AppShell.d.ts  (105 B)
            AppShell.jsx  (438 B)
            AppShell.prompt.md  (253 B)
            Hero.d.ts  (102 B)
            Hero.jsx  (973 B)
            Hero.prompt.md  (357 B)
            Section.d.ts  (93 B)
            Section.jsx  (435 B)
            Section.prompt.md  (237 B)
            app.card.html  (1,604 B)
          chat/
            ChatComposer.d.ts  (111 B)
            ChatComposer.jsx  (821 B)
            ChatComposer.prompt.md  (239 B)
            ConversationMessage.d.ts  (106 B)
            ConversationMessage.jsx  (883 B)
            ConversationMessage.prompt.md  (317 B)
            chat.card.html  (1,476 B)
          core/
            Avatar.d.ts  (68 B)
            Avatar.jsx  (557 B)
            Avatar.prompt.md  (184 B)
            Badge.d.ts  (115 B)
            Badge.jsx  (734 B)
            Badge.prompt.md  (160 B)
            Button.d.ts  (218 B)
            Button.jsx  (1,017 B)
            Button.prompt.md  (383 B)
            Divider.d.ts  (47 B)
            Divider.jsx  (184 B)
            Divider.prompt.md  (112 B)
            IconButton.d.ts  (115 B)
            IconButton.jsx  (549 B)
            IconButton.prompt.md  (227 B)
            Status.d.ts  (104 B)
            Status.jsx  (553 B)
            Status.prompt.md  (153 B)
            core.card.html  (1,972 B)
          feedback/
            Alert.d.ts  (109 B)
            Alert.jsx  (780 B)
            Alert.prompt.md  (215 B)
            EmptyState.d.ts  (113 B)
            EmptyState.jsx  (625 B)
            EmptyState.prompt.md  (217 B)
            ErrorState.d.ts  (86 B)
            ErrorState.jsx  (907 B)
            ErrorState.prompt.md  (168 B)
            Skeleton.d.ts  (83 B)
            Skeleton.jsx  (382 B)
            Skeleton.prompt.md  (226 B)
            Toast.d.ts  (103 B)
            Toast.jsx  (859 B)
            Toast.prompt.md  (174 B)
            Tooltip.d.ts  (69 B)
            Tooltip.jsx  (691 B)
            Tooltip.prompt.md  (175 B)
            feedback.card.html  (1,949 B)
          forms/
            Input.d.ts  (133 B)
            Input.jsx  (503 B)
            Input.prompt.md  (178 B)
            Listbox.d.ts  (91 B)
            Listbox.jsx  (562 B)
            Listbox.prompt.md  (164 B)
            SearchInput.d.ts  (93 B)
            SearchInput.jsx  (662 B)
            SearchInput.prompt.md  (169 B)
            Select.d.ts  (86 B)
            Select.jsx  (451 B)
            Select.prompt.md  (170 B)
            Textarea.d.ts  (103 B)
            Textarea.jsx  (436 B)
            Textarea.prompt.md  (147 B)
            forms.card.html  (1,505 B)
          navigation/
            BrandSelector.d.ts  (98 B)
            BrandSelector.jsx  (884 B)
            BrandSelector.prompt.md  (215 B)
            NavItem.d.ts  (99 B)
            NavItem.jsx  (523 B)
            NavItem.prompt.md  (185 B)
            Sidebar.d.ts  (135 B)
            Sidebar.jsx  (1,173 B)
            Sidebar.prompt.md  (218 B)
            TopBar.d.ts  (85 B)
            TopBar.jsx  (1,183 B)
            TopBar.prompt.md  (177 B)
            navigation.card.html  (1,471 B)
          overlays/
            Dialog.d.ts  (145 B)
            Dialog.jsx  (1,001 B)
            Dialog.prompt.md  (334 B)
            Popover.d.ts  (89 B)
            Popover.jsx  (418 B)
            Popover.prompt.md  (215 B)
            overlays.card.html  (1,589 B)
          surfaces/
            ActionCard.d.ts  (159 B)
            ActionCard.jsx  (1,186 B)
            ActionCard.prompt.md  (278 B)
            ActivityItem.d.ts  (124 B)
            ActivityItem.jsx  (726 B)
            ActivityItem.prompt.md  (224 B)
            BrandCard.d.ts  (117 B)
            BrandCard.jsx  (1,064 B)
            BrandCard.prompt.md  (192 B)
            Card.d.ts  (69 B)
            Card.jsx  (243 B)
            Card.prompt.md  (175 B)
            HistoryItem.d.ts  (80 B)
            HistoryItem.jsx  (795 B)
            HistoryItem.prompt.md  (180 B)
            KnowledgeCard.d.ts  (96 B)
            KnowledgeCard.jsx  (882 B)
            KnowledgeCard.prompt.md  (185 B)
            surfaces.card.html  (1,884 B)
        guidelines/
          brand-iconography.html  (1,137 B)
          brand-isotipo.html  (912 B)
          brand-logotipo.html  (779 B)
          colors-light.html  (775 B)
          colors-navy.html  (872 B)
          colors-primary.html  (1,073 B)
          colors-semantic.html  (1,169 B)
          colors-text.html  (784 B)
          spacing-radius.html  (879 B)
          spacing-scale.html  (1,007 B)
          type-body.html  (769 B)
          type-display.html  (639 B)
          type-eyebrow.html  (716 B)
        tokens/
          base.css  (478 B)
          colors.css  (1,727 B)
          fonts.css  (604 B)
          spacing.css  (778 B)
          typography.css  (502 B)
        ui_kits/
          atlas-web/
            ActivityScreen.jsx  (1,490 B)
            BrandsScreen.jsx  (1,418 B)
            ChatScreen.jsx  (1,698 B)
            HomeScreen.jsx  (5,140 B)
            IconRocket.jsx  (1,132 B)
            KnowledgeScreen.jsx  (1,420 B)
            index.html  (2,122 B)
        uploads/
          Inter-Italic-VariableFont_opsz,wght.ttf  (904,532 B)
          Sora-VariableFont_wght.ttf  (110,224 B)
          colores-ATLAS.png  (2,949 B)
          logo-ATLAS-negro.svg  (2,510 B)
          logo-atlas-black.svg  (2,124 B)
      public/
      src/
        config.ts  (708 B)
        server.ts  (12,190 B)
        session-store.ts  (25,664 B)
        client/
          app.ts  (4,470 B)
          main.ts  (202 B)
          api/
            client.ts  (10,772 B)
          components/
            brand-card.ts  (4,274 B)
            shell.ts  (17,221 B)
          lib/
            brand-catalog.ts  (496 B)
            brand-context.ts  (308 B)
            chat-reasoning.ts  (4,728 B)
            copy-text.ts  (717 B)
            dialog.ts  (2,562 B)
            expandable-details.ts  (1,064 B)
            format-chat-metrics.ts  (2,048 B)
            history.ts  (1,525 B)
            icons.ts  (3,150 B)
            knowledge-duplicate-file-name.ts  (2,314 B)
            markdown.ts  (342 B)
            theme.ts  (1,498 B)
            workspace-switch.ts  (5,682 B)
          pages/
            activity.ts  (11,991 B)
            brands.ts  (15,732 B)
            chat.ts  (16,493 B)
            home.ts  (16,989 B)
            knowledge.ts  (54,347 B)
          state/
            app-state.ts  (6,958 B)
          styles/
            app.css  (51,444 B)
            tokens.css  (2,952 B)
        i18n/
          es.ts  (19,423 B)
          index.ts  (897 B)
        lib/
          format-atlas-error.ts  (1,752 B)
          load-env.ts  (1,086 B)
          knowledge-upload/
            chunk-excel.ts  (2,919 B)
            chunk-text.ts  (1,051 B)
            constants.ts  (1,042 B)
            extract-excel.ts  (6,306 B)
            extract-text.ts  (2,980 B)
            folder.ts  (1,334 B)
            knowledge-folders-store.ts  (3,521 B)
            partition-upload-files.ts  (624 B)
            upload-errors.ts  (235 B)
          web-persistence/
            activity-store.ts  (2,176 B)
            conversation-store.ts  (7,166 B)
            governance-activity.ts  (2,621 B)
            types.ts  (105 B)
            workspace-storage-paths.ts  (1,310 B)
        presentation/
          brand-errors.ts  (555 B)
          format-error.ts  (2,081 B)
          map-activity.ts  (7,799 B)
          map-brand.ts  (4,452 B)
          map-chat-response.ts  (4,142 B)
          map-history.ts  (1,472 B)
          map-knowledge-documents.ts  (5,848 B)
          map-knowledge-folders.ts  (397 B)
          map-knowledge-upload.ts  (239 B)
          map-knowledge.ts  (4,594 B)
      tests/
        conversation-activity-persistence.test.ts  (21,658 B)
        format-atlas-error.test.ts  (1,165 B)
        knowledge-ingest-int003.test.ts  (4,231 B)
        knowledge-upload.test.ts  (3,547 B)
        server.test.ts  (51,416 B)
        client/
          activity.test.ts  (3,265 B)
          app-navigation.test.ts  (1,825 B)
          app-state.test.ts  (1,275 B)
          brand-switcher.test.ts  (2,866 B)
          brands.test.ts  (10,962 B)
          chat.test.ts  (9,057 B)
          copy-text.test.ts  (1,034 B)
          format-chat-metrics.test.ts  (753 B)
          history.test.ts  (2,258 B)
          home.test.ts  (12,184 B)
          knowledge-duplicate-file-name.test.ts  (2,003 B)
          knowledge.test.ts  (19,898 B)
          markdown.test.ts  (563 B)
          phase-3h.test.ts  (2,630 B)
          phase-3i-accessibility.test.ts  (6,750 B)
          shell.test.ts  (1,598 B)
          theme.test.ts  (1,635 B)
          workspace-switch.test.ts  (3,724 B)
        fixtures/
          fixture-utils.ts  (4,181 B)
          sample.md  (89 B)
          sample.txt  (73 B)
        i18n/
          index.test.ts  (762 B)
        lib/
          chunk-excel.test.ts  (1,877 B)
          extract-excel.test.ts  (6,086 B)
          knowledge-folder.test.ts  (1,193 B)
          knowledge-folders-store.test.ts  (2,370 B)
          partition-upload-files.test.ts  (906 B)
        presentation/
          format-error.test.ts  (1,721 B)
          map-activity.test.ts  (3,831 B)
          map-brand.test.ts  (3,907 B)
          map-chat-response.test.ts  (1,611 B)
          map-history.test.ts  (904 B)
          map-knowledge-documents.test.ts  (3,199 B)
          map-knowledge.test.ts  (2,722 B)
  design/
    fonts/
      Inter/
        Inter-Italic-VariableFont_opsz,wght.ttf  (904,532 B)
        Inter-VariableFont_opsz,wght.ttf  (874,708 B)
        OFL.txt  (4,470 B)
        README.txt  (4,230 B)
        static/
          Inter_18pt-Black.ttf  (344,820 B)
          Inter_18pt-BlackItalic.ttf  (348,712 B)
          Inter_18pt-Bold.ttf  (344,152 B)
          Inter_18pt-BoldItalic.ttf  (348,184 B)
          Inter_18pt-ExtraBold.ttf  (345,008 B)
          Inter_18pt-ExtraBoldItalic.ttf  (349,064 B)
          Inter_18pt-ExtraLight.ttf  (343,532 B)
          Inter_18pt-ExtraLightItalic.ttf  (347,452 B)
          Inter_18pt-Italic.ttf  (346,480 B)
          Inter_18pt-Light.ttf  (343,704 B)
          Inter_18pt-LightItalic.ttf  (347,316 B)
          Inter_18pt-Medium.ttf  (343,200 B)
          Inter_18pt-MediumItalic.ttf  (346,884 B)
          Inter_18pt-Regular.ttf  (342,680 B)
          Inter_18pt-SemiBold.ttf  (343,828 B)
          Inter_18pt-SemiBoldItalic.ttf  (347,760 B)
          Inter_18pt-Thin.ttf  (343,088 B)
          Inter_18pt-ThinItalic.ttf  (346,916 B)
          Inter_24pt-Black.ttf  (344,764 B)
          Inter_24pt-BlackItalic.ttf  (348,612 B)
          Inter_24pt-Bold.ttf  (344,032 B)
          Inter_24pt-BoldItalic.ttf  (347,948 B)
          Inter_24pt-ExtraBold.ttf  (344,800 B)
          Inter_24pt-ExtraBoldItalic.ttf  (348,896 B)
          Inter_24pt-ExtraLight.ttf  (343,516 B)
          Inter_24pt-ExtraLightItalic.ttf  (347,352 B)
          Inter_24pt-Italic.ttf  (346,580 B)
          Inter_24pt-Light.ttf  (343,440 B)
          Inter_24pt-LightItalic.ttf  (347,300 B)
          Inter_24pt-Medium.ttf  (342,936 B)
          Inter_24pt-MediumItalic.ttf  (347,000 B)
          Inter_24pt-Regular.ttf  (342,732 B)
          Inter_24pt-SemiBold.ttf  (343,640 B)
          Inter_24pt-SemiBoldItalic.ttf  (347,616 B)
          Inter_24pt-Thin.ttf  (342,944 B)
          Inter_24pt-ThinItalic.ttf  (346,976 B)
          Inter_28pt-Black.ttf  (344,676 B)
          Inter_28pt-BlackItalic.ttf  (348,608 B)
          Inter_28pt-Bold.ttf  (343,972 B)
          Inter_28pt-BoldItalic.ttf  (348,088 B)
          Inter_28pt-ExtraBold.ttf  (344,692 B)
          Inter_28pt-ExtraBoldItalic.ttf  (348,944 B)
          Inter_28pt-ExtraLight.ttf  (343,184 B)
          Inter_28pt-ExtraLightItalic.ttf  (347,268 B)
          Inter_28pt-Italic.ttf  (346,528 B)
          Inter_28pt-Light.ttf  (343,092 B)
          Inter_28pt-LightItalic.ttf  (347,092 B)
          Inter_28pt-Medium.ttf  (342,808 B)
          Inter_28pt-MediumItalic.ttf  (346,900 B)
          Inter_28pt-Regular.ttf  (342,484 B)
          Inter_28pt-SemiBold.ttf  (343,244 B)
          Inter_28pt-SemiBoldItalic.ttf  (347,380 B)
          Inter_28pt-Thin.ttf  (342,904 B)
          Inter_28pt-ThinItalic.ttf  (346,980 B)
      Sora/
        OFL.txt  (4,477 B)
        README.txt  (2,247 B)
        Sora-VariableFont_wght.ttf  (110,224 B)
        static/
          Sora-Bold.ttf  (57,936 B)
          Sora-ExtraBold.ttf  (57,980 B)
          Sora-ExtraLight.ttf  (58,028 B)
          Sora-Light.ttf  (57,964 B)
          Sora-Medium.ttf  (57,912 B)
          Sora-Regular.ttf  (57,796 B)
          Sora-SemiBold.ttf  (57,980 B)
          Sora-Thin.ttf  (57,896 B)
    logo/
  docs/
    README.md  (5,674 B)
    WEB_UI_PRODUCT_UX.md  (25,830 B)
    guides/
      VERIFICATION_PLAYBOOK.md  (6,258 B)
    proposals/
      rfc/
        RFC-0001-repository-architecture.md  (28,405 B)
  examples/
    README.md  (907 B)
    cli-workspace-demo/
      README.md  (663 B)
      atlas.workspace.json  (465 B)
      package.json  (380 B)
    compiler-events-demo/
      README.md  (529 B)
      package.json  (422 B)
      run.ts  (2,398 B)
    compiler-in-memory-demo/
      README.md  (1,119 B)
      package.json  (371 B)
      run.ts  (5,333 B)
    knowledge-compiler-demo/
      package.json  (421 B)
      run.ts  (4,539 B)
    runtime-demo/
      README.md  (633 B)
      package.json  (321 B)
      run.ts  (3,548 B)
    sdk-demo/
      README.md  (584 B)
      package.json  (308 B)
      run.ts  (1,870 B)
  packages/
    agent/
      CHANGELOG.md  (82 B)
      README.md  (250 B)
      package.json  (556 B)
      tsconfig.json  (154 B)
      vitest.config.ts  (186 B)
      docs/
        .gitkeep  (0 B)
      src/
        index.ts  (95 B)
        contracts/
          .gitkeep  (0 B)
        internal/
          .gitkeep  (0 B)
      tests/
        smoke.test.ts  (163 B)
    cli/
      CHANGELOG.md  (642 B)
      README.md  (2,178 B)
      package.json  (866 B)
      tsconfig.json  (154 B)
      vitest.config.ts  (428 B)
      docs/
        .gitkeep  (0 B)
      src/
        index.ts  (1,363 B)
        application/
          cli-app.ts  (2,622 B)
          container.ts  (1,809 B)
        bin/
          atlas.ts  (142 B)
        chat/
          chat-repl.ts  (5,452 B)
          chat-session.ts  (2,101 B)
          chat-turn.ts  (5,816 B)
          feedback.ts  (818 B)
          map-reasoning-steps.ts  (2,498 B)
        commands/
          ask-command.ts  (2,116 B)
          brand-command.ts  (2,294 B)
          chat-command.ts  (685 B)
          compile-command.ts  (1,827 B)
          doctor-command.ts  (3,342 B)
          memory-command.ts  (2,375 B)
          plan-command.ts  (3,210 B)
          run-command.ts  (1,975 B)
          version-command.ts  (1,725 B)
          web-command.ts  (2,055 B)
        configuration/
          workspace-config.ts  (2,296 B)
          workspace-loader.ts  (1,155 B)
        contracts/
          .gitkeep  (0 B)
        internal/
          .gitkeep  (0 B)
        output/
          exit-codes.ts  (518 B)
          renderer.ts  (245 B)
        registry/
          command-registry.ts  (620 B)
        services/
          atlas-service.ts  (5,126 B)
        workspace/
          brand-profile.ts  (3,496 B)
          feedback-context.ts  (2,094 B)
      tests/
        atlas-service.test.ts  (3,456 B)
        brand-command.test.ts  (11,938 B)
        brand-profile.test.ts  (4,049 B)
        chat-repl.test.ts  (10,172 B)
        chat-session.test.ts  (2,047 B)
        chat-turn.test.ts  (6,415 B)
        cli.test.ts  (14,969 B)
        dev-bootstrap.test.ts  (1,594 B)
        feedback-context.test.ts  (1,731 B)
        map-reasoning-steps.test.ts  (1,181 B)
        web-command.test.ts  (624 B)
        workspace-config.test.ts  (1,964 B)
    compiler/
      CHANGELOG.md  (1,161 B)
      README.md  (2,583 B)
      package.json  (804 B)
      tsconfig.json  (154 B)
      vitest.config.ts  (414 B)
      docs/
        .gitkeep  (0 B)
      src/
        index.ts  (2,029 B)
        compiler/
          atlas-compiler.ts  (1,809 B)
        context/
          artifact.ts  (615 B)
          compilation-context.ts  (2,483 B)
          compilation-unit.ts  (717 B)
          diagnostic.ts  (824 B)
          knowledge.ts  (1,768 B)
        contracts/
          .gitkeep  (0 B)
          artifact.ts  (318 B)
          compilation-context.ts  (1,692 B)
          compilation-lifecycle.ts  (591 B)
          compilation-result.ts  (231 B)
          compilation-unit.ts  (373 B)
          compiler-pipeline.ts  (342 B)
          compiler-stage-id.ts  (541 B)
          compiler-stage.ts  (460 B)
          compiler.ts  (442 B)
          diagnostic.ts  (787 B)
          generator.ts  (439 B)
          index.ts  (1,157 B)
          knowledge-graph.ts  (570 B)
          knowledge-node.ts  (324 B)
          publisher.ts  (440 B)
        internal/
          .gitkeep  (0 B)
          diagnostics.ts  (378 B)
        pipeline/
          default-pipeline.ts  (1,493 B)
          default-stages.ts  (5,708 B)
          define-stage.ts  (1,535 B)
        registries/
          generator-registry.ts  (804 B)
          publisher-registry.ts  (804 B)
      tests/
        context.test.ts  (2,906 B)
        contracts.test.ts  (1,214 B)
        events.test.ts  (1,812 B)
        pipeline.test.ts  (4,374 B)
        registries.test.ts  (1,569 B)
    context/
      CHANGELOG.md  (84 B)
      README.md  (254 B)
      package.json  (560 B)
      tsconfig.json  (154 B)
      vitest.config.ts  (186 B)
      docs/
        .gitkeep  (0 B)
      src/
        index.ts  (97 B)
        contracts/
          .gitkeep  (0 B)
        internal/
          .gitkeep  (0 B)
      tests/
        smoke.test.ts  (165 B)
    context-planner/
      CHANGELOG.md  (92 B)
      README.md  (270 B)
      package.json  (576 B)
      tsconfig.json  (154 B)
      vitest.config.ts  (186 B)
      docs/
        .gitkeep  (0 B)
      src/
        index.ts  (105 B)
        contracts/
          .gitkeep  (0 B)
        internal/
          .gitkeep  (0 B)
      tests/
        smoke.test.ts  (173 B)
    core/
      CHANGELOG.md  (1,158 B)
      README.md  (2,049 B)
      package.json  (574 B)
      tsconfig.json  (154 B)
      vitest.config.ts  (186 B)
      docs/
        .gitkeep  (0 B)
      src/
        index.ts  (814 B)
        result.ts  (552 B)
        timestamp.ts  (743 B)
        trace-id.ts  (589 B)
        contracts/
          .gitkeep  (0 B)
          configuration.ts  (173 B)
          context.ts  (186 B)
          event.ts  (355 B)
          index.ts  (530 B)
          input.ts  (485 B)
          metadata.ts  (347 B)
          metrics.ts  (205 B)
          module-contract.ts  (381 B)
          output.ts  (529 B)
          request.ts  (163 B)
          status.ts  (542 B)
        errors/
          atlas-error.ts  (450 B)
          create-error.ts  (2,046 B)
          index.ts  (201 B)
          severity.ts  (462 B)
        internal/
          .gitkeep  (0 B)
          deep-freeze.ts  (405 B)
        text/
          fold-diacritics.ts  (495 B)
        types/
          identifier.ts  (1,048 B)
          index.ts  (172 B)
          metadata.ts  (1,408 B)
          namespace.ts  (1,008 B)
          version.ts  (1,454 B)
      tests/
        contracts.test.ts  (3,402 B)
        errors.test.ts  (2,161 B)
        fold-diacritics.test.ts  (767 B)
        primitives.test.ts  (1,841 B)
        types.test.ts  (3,501 B)
    events/
      CHANGELOG.md  (539 B)
      README.md  (2,173 B)
      package.json  (741 B)
      tsconfig.json  (154 B)
      vitest.config.ts  (414 B)
      docs/
        .gitkeep  (0 B)
      src/
        index.ts  (1,096 B)
        bus/
          in-memory-event-bus.ts  (1,674 B)
        contracts/
          .gitkeep  (0 B)
          event-definition.ts  (954 B)
          event.ts  (2,187 B)
        definitions/
          compiler-completed.ts  (658 B)
        event/
          create-event.ts  (1,116 B)
          define-event.ts  (670 B)
        internal/
          .gitkeep  (0 B)
        publisher/
          event-publisher.ts  (1,493 B)
      tests/
        bus.test.ts  (2,802 B)
        event.test.ts  (1,603 B)
    graph/
      CHANGELOG.md  (82 B)
      README.md  (250 B)
      package.json  (556 B)
      tsconfig.json  (154 B)
      vitest.config.ts  (186 B)
      docs/
        .gitkeep  (0 B)
      src/
        index.ts  (95 B)
        contracts/
          .gitkeep  (0 B)
        internal/
          .gitkeep  (0 B)
      tests/
        smoke.test.ts  (163 B)
    intelligence/
      package.json  (806 B)
      tsconfig.json  (154 B)
      vitest.config.ts  (439 B)
      src/
        goal-normalizer.ts  (3,974 B)
        index.ts  (1,652 B)
        planning-compiler.ts  (868 B)
        planning-engine.ts  (5,337 B)
        planning-errors.ts  (803 B)
        planning-model.ts  (2,265 B)
        planning-registry.ts  (1,527 B)
        planning-strategies.ts  (11,025 B)
        planning-validator.ts  (4,094 B)
        workflow-builder.ts  (4,115 B)
      tests/
        planning-engine.test.ts  (15,638 B)
    knowledge/
      CHANGELOG.md  (1,061 B)
      README.md  (2,743 B)
      package.json  (1,070 B)
      tsconfig.json  (154 B)
      vitest.config.ts  (553 B)
      docs/
        .gitkeep  (0 B)
      src/
        index.ts  (1,325 B)
        adapters/
          canonical-source.ts  (3,943 B)
          index.ts  (668 B)
          knowledge-projection-adapter.ts  (3,690 B)
          knowledge-projection-error.ts  (385 B)
          projection-types.ts  (708 B)
        contracts/
          .gitkeep  (0 B)
        domain/
          aggregates/
            knowledge-object.ts  (1,494 B)
          entities/
            knowledge-relationship.ts  (780 B)
            knowledge-statement.ts  (815 B)
          value-objects/
            context-scope.ts  (1,820 B)
            governance-record.ts  (1,234 B)
            index.ts  (1,079 B)
            knowledge-object-id.ts  (599 B)
            knowledge-typed-id.ts  (1,080 B)
            knowledge-version.ts  (735 B)
            lifecycle-state.ts  (659 B)
            object-behavior.ts  (885 B)
            object-kind.ts  (1,060 B)
            object-metadata.ts  (1,827 B)
            relationship-id.ts  (578 B)
            relationship-type.ts  (1,132 B)
            statement-content.ts  (1,470 B)
            statement-id.ts  (548 B)
            trust-score.ts  (1,136 B)
        errors/
          create-knowledge-error.ts  (361 B)
        factories/
          index.ts  (4,603 B)
        ingest/
          document-ingest.ts  (5,411 B)
        internal/
          .gitkeep  (0 B)
        metamodel/
          extension-model.ts  (1,263 B)
          index.ts  (815 B)
          meta-concept-descriptor.ts  (1,617 B)
          meta-concept-id.ts  (607 B)
          meta-concept-registry.ts  (16,638 B)
          meta-layer.ts  (447 B)
          metamodel-invariants.ts  (2,877 B)
        validators/
          context-validator.ts  (727 B)
          identity-validator.ts  (1,146 B)
          index.ts  (710 B)
          knowledge-object-validator.ts  (565 B)
          metamodel-validator.ts  (2,095 B)
          relationship-validator.ts  (1,185 B)
          statement-validator.ts  (739 B)
      tests/
        adapters/
          knowledge-projection-adapter.test.ts  (5,563 B)
        domain/
          domain-core.test.ts  (2,509 B)
        factories/
          factories.test.ts  (1,460 B)
        ingest/
          document-ingest.test.ts  (1,598 B)
        metamodel/
          metamodel.test.ts  (2,496 B)
        validators/
          validators-extended.test.ts  (4,516 B)
          validators.test.ts  (391 B)
    llm/
      README.md  (2,601 B)
      package.json  (587 B)
      tsconfig.json  (154 B)
      vitest.config.ts  (186 B)
      src/
        budget.ts  (1,145 B)
        index.ts  (1,023 B)
        provider.ts  (1,356 B)
        tool-loop.ts  (4,056 B)
        providers/
          anthropic-provider.ts  (6,795 B)
          fake-provider.ts  (1,221 B)
          openai-compatible-provider.ts  (7,712 B)
      tests/
        anthropic-provider.test.ts  (4,209 B)
        openai-compatible-provider.test.ts  (7,191 B)
        tool-loop.test.ts  (7,742 B)
    memory/
      CHANGELOG.md  (83 B)
      README.md  (252 B)
      package.json  (652 B)
      tsconfig.json  (154 B)
      vitest.config.ts  (186 B)
      docs/
        .gitkeep  (0 B)
      src/
        index.ts  (822 B)
        application/
          index.ts  (1,325 B)
          request-validation.ts  (5,590 B)
          contracts/
            DeleteMemoryRequest.ts  (178 B)
            RetrieveMemoryRequest.ts  (104 B)
            SearchMemoryRequest.ts  (175 B)
            StoreMemoryRequest.ts  (234 B)
            UpdateMemoryRequest.ts  (235 B)
          errors/
            ApplicationError.ts  (1,540 B)
          responses/
            DeleteMemoryResponse.ts  (100 B)
            RetrieveMemoryResponse.ts  (178 B)
            SearchMemoryResponse.ts  (230 B)
            StoreMemoryResponse.ts  (204 B)
            UpdateMemoryResponse.ts  (205 B)
          use-cases/
            DeleteMemoryUseCase.ts  (1,059 B)
            RetrieveMemoryUseCase.ts  (1,107 B)
            SearchMemoryUseCase.ts  (1,118 B)
            StoreMemoryUseCase.ts  (1,245 B)
            UpdateMemoryUseCase.ts  (1,207 B)
        contracts/
          .gitkeep  (0 B)
        domain/
          index.ts  (4,684 B)
          aggregates/
            memory-session-aggregate.ts  (71 B)
            record-aggregate.ts  (1,141 B)
          constants/
            memory-constants.ts  (1,372 B)
            memory-session-lifecycle.ts  (1,384 B)
            memory-session-operations.ts  (135 B)
            storage-constraints.ts  (767 B)
          entities/
            collection.ts  (555 B)
            namespace.ts  (464 B)
            record.ts  (899 B)
            relationship.ts  (574 B)
            version.ts  (665 B)
          errors/
            create-memory-error.ts  (1,608 B)
            memory-error-codes.ts  (1,345 B)
          factories/
            memory-factories.ts  (5,891 B)
            memory-session-factories.ts  (10,729 B)
          interfaces/
            consistency-provider.ts  (465 B)
            memory-store.ts  (301 B)
          types/
            memory-session-types.ts  (3,986 B)
            memory-types.ts  (1,580 B)
          validators/
            memory-session-validators.ts  (3,692 B)
            memory-validators.ts  (8,539 B)
          value-objects/
            checksum.ts  (636 B)
            collection-id.ts  (429 B)
            collection-type.ts  (617 B)
            execution-id.ts  (667 B)
            index.ts  (1,738 B)
            memory-metadata.ts  (1,500 B)
            memory-operation-id.ts  (474 B)
            memory-operation-type.ts  (673 B)
            memory-session-context.ts  (1,541 B)
            memory-session-id.ts  (456 B)
            memory-session-metadata.ts  (742 B)
            memory-session-revision.ts  (765 B)
            memory-session-status.ts  (583 B)
            memory-typed-id.ts  (1,061 B)
            namespace-id.ts  (420 B)
            namespace-type.ts  (612 B)
            record-id.ts  (393 B)
            record-status.ts  (468 B)
            record-type.ts  (597 B)
            relationship-id.ts  (447 B)
            relationship-type.ts  (539 B)
            revision-number.ts  (716 B)
            version-id.ts  (402 B)
            visibility.ts  (438 B)
        engine/
          MemoryEngine.ts  (14,498 B)
          create-memory-engine.ts  (941 B)
          engine-errors.ts  (2,219 B)
          engine-requests.ts  (161 B)
          index.ts  (219 B)
          memory-engine-consistency.ts  (910 B)
          memory-engine-session-orchestrator.ts  (8,424 B)
          memory-engine-session-registry.ts  (1,530 B)
          memory-engine-session-validation.ts  (7,027 B)
        internal/
          .gitkeep  (0 B)
          engine-query-validation.ts  (1,878 B)
          memory-record-update.ts  (866 B)
          query-executor.ts  (1,410 B)
          result.ts  (504 B)
          store-gateway.ts  (1,560 B)
        providers/
          create-memory-providers.ts  (2,741 B)
          index/
            in-memory-index-provider.ts  (1,859 B)
            index-provider.ts  (650 B)
          retrieval/
            in-memory-retrieval-provider.ts  (2,313 B)
            retrieval-provider.ts  (677 B)
          storage/
            create-json-file-memory-engine.ts  (1,103 B)
            in-memory-storage-provider.ts  (1,647 B)
            json-file-storage-provider.ts  (3,320 B)
            legacy-memory-store-storage-adapter.ts  (2,531 B)
            memory-store-from-storage-provider.ts  (3,888 B)
            storage-provider.ts  (751 B)
        repositories/
          CollectionRepository.ts  (3,652 B)
          NamespaceRepository.ts  (3,312 B)
          RecordRepository.ts  (6,110 B)
          RelationshipRepository.ts  (3,531 B)
          VersionRepository.ts  (4,389 B)
          repository-errors.ts  (2,090 B)
          repository-projections.ts  (8,454 B)
          repository-store.ts  (1,804 B)
      tests/
        public-api.test.ts  (2,389 B)
        smoke.test.ts  (164 B)
        application/
          application-error.test.ts  (2,305 B)
          architecture-boundaries.test.ts  (1,387 B)
          delete-memory-use-case.test.ts  (1,932 B)
          request-validation.test.ts  (2,562 B)
          retrieve-memory-use-case.test.ts  (2,641 B)
          search-memory-use-case.test.ts  (2,169 B)
          store-memory-use-case.test.ts  (2,486 B)
          test-helpers.ts  (2,082 B)
          update-memory-use-case.test.ts  (2,222 B)
        domain/
          domain-core.test.ts  (12,989 B)
          memory-session.test.ts  (6,106 B)
        engine/
          json-file-memory-engine.test.ts  (1,297 B)
          memory-engine-operations.test.ts  (1,836 B)
          memory-engine-providers.test.ts  (3,892 B)
          memory-engine-session.test.ts  (9,960 B)
          memory-engine.test.ts  (13,324 B)
        providers/
          index-provider.test.ts  (2,413 B)
          json-file-storage-provider.test.ts  (3,289 B)
          retrieval-provider.test.ts  (4,022 B)
          storage-provider.test.ts  (3,210 B)
        repositories/
          memory-repositories.test.ts  (9,389 B)
        support/
          memory-store-test-support.ts  (1,592 B)
    ontology/
      CHANGELOG.md  (85 B)
      README.md  (256 B)
      package.json  (562 B)
      tsconfig.json  (154 B)
      vitest.config.ts  (186 B)
      docs/
        .gitkeep  (0 B)
      src/
        index.ts  (98 B)
        contracts/
          .gitkeep  (0 B)
        internal/
          .gitkeep  (0 B)
      tests/
        smoke.test.ts  (166 B)
    plugin/
      CHANGELOG.md  (83 B)
      README.md  (252 B)
      package.json  (558 B)
      tsconfig.json  (154 B)
      vitest.config.ts  (186 B)
      docs/
        .gitkeep  (0 B)
      src/
        index.ts  (96 B)
        contracts/
          .gitkeep  (0 B)
        internal/
          .gitkeep  (0 B)
      tests/
        smoke.test.ts  (164 B)
    prompt/
      CHANGELOG.md  (83 B)
      README.md  (252 B)
      package.json  (558 B)
      tsconfig.json  (154 B)
      vitest.config.ts  (186 B)
      docs/
        .gitkeep  (0 B)
      src/
        index.ts  (96 B)
        contracts/
          .gitkeep  (0 B)
        internal/
          .gitkeep  (0 B)
      tests/
        smoke.test.ts  (164 B)
    publisher/
      CHANGELOG.md  (86 B)
      README.md  (258 B)
      package.json  (564 B)
      tsconfig.json  (154 B)
      vitest.config.ts  (186 B)
      docs/
        .gitkeep  (0 B)
      src/
        index.ts  (99 B)
        contracts/
          .gitkeep  (0 B)
        internal/
          .gitkeep  (0 B)
      tests/
        smoke.test.ts  (167 B)
    retrieval/
      CHANGELOG.md  (86 B)
      README.md  (258 B)
      package.json  (688 B)
      tsconfig.json  (154 B)
      vitest.config.ts  (186 B)
      docs/
        .gitkeep  (0 B)
      src/
        index.ts  (267 B)
        retrieval-pipeline.ts  (3,440 B)
        contracts/
          .gitkeep  (0 B)
        internal/
          .gitkeep  (0 B)
      tests/
        retrieval-pipeline.test.ts  (2,792 B)
    runtime/
      CHANGELOG.md  (699 B)
      README.md  (2,015 B)
      package.json  (817 B)
      tsconfig.json  (154 B)
      vitest.config.ts  (759 B)
      docs/
        .gitkeep  (0 B)
      src/
        index.ts  (4,387 B)
        agents/
          agent-runtime.factory.ts  (269 B)
          agent-runtime.ts  (328 B)
          index.ts  (236 B)
          types.ts  (460 B)
        api/
          diagnostics-api.ts  (230 B)
          event-api.ts  (359 B)
          execution-api.ts  (407 B)
          index.ts  (936 B)
          lifecycle-api.ts  (332 B)
          task-api.ts  (315 B)
          workflow-api.ts  (366 B)
        compat/
          index.ts  (129 B)
          legacy-atlas-runtime.ts  (1,162 B)
        composition/
          component-registry.ts  (1,398 B)
          create-runtime-composition.ts  (3,541 B)
          index.ts  (440 B)
          runtime-dependencies.ts  (1,289 B)
          runtime-public-api.ts  (2,194 B)
        context/
          execution-context.ts  (1,687 B)
        contracts/
          .gitkeep  (0 B)
          artifact-executor.ts  (440 B)
          execution-context.ts  (1,036 B)
          execution-output.ts  (304 B)
          execution-result.ts  (228 B)
          runtime-lifecycle.ts  (463 B)
          runtime.ts  (476 B)
        definitions/
          execution-events.ts  (1,315 B)
          runtime-completed.ts  (716 B)
          runtime-started.ts  (563 B)
        diagnostics/
          diagnostics.factory.ts  (2,234 B)
          diagnostics.ts  (282 B)
          index.ts  (244 B)
          types.ts  (877 B)
        engine/
          execution-aggregate.ts  (7,117 B)
          execution-engine.factory.ts  (2,018 B)
          execution-engine.ts  (683 B)
          execution-flow.ts  (6,545 B)
          execution-repository.ts  (8,218 B)
          index.ts  (244 B)
          types.ts  (514 B)
        errors/
          error-manager.factory.ts  (316 B)
          error-manager.ts  (415 B)
          index.ts  (235 B)
          types.ts  (614 B)
        events/
          event-dispatcher.factory.ts  (4,706 B)
          event-dispatcher.ts  (481 B)
          index.ts  (265 B)
          types.ts  (671 B)
        executors/
          default-executors.ts  (714 B)
        internal/
          .gitkeep  (0 B)
        lifecycle/
          index.ts  (293 B)
          lifecycle-manager.factory.ts  (1,779 B)
          lifecycle-manager.ts  (518 B)
          transitions.ts  (697 B)
          types.ts  (1,143 B)
        pipeline/
          index.ts  (1,065 B)
          pipeline-coordinator.factory.ts  (16,326 B)
          pipeline-coordinator.ts  (1,156 B)
          pipeline-events.ts  (678 B)
          pipeline-executor.ts  (1,276 B)
          pipeline-factory.ts  (859 B)
          pipeline-model.ts  (2,193 B)
          pipeline-projection.ts  (4,791 B)
          pipeline-registry.ts  (877 B)
          pipeline-stage.ts  (327 B)
          pipeline.ts  (581 B)
          types.ts  (672 B)
        registries/
          executor-registry.ts  (859 B)
        runtime/
          atlas-runtime.ts  (877 B)
        state/
          index.ts  (232 B)
          state-manager.factory.ts  (2,949 B)
          state-manager.ts  (796 B)
          types.ts  (1,539 B)
        tasks/
          index.ts  (232 B)
          task-scheduler.factory.ts  (314 B)
          task-scheduler.ts  (387 B)
          types.ts  (562 B)
        workflow/
          index.ts  (255 B)
          types.ts  (584 B)
          workflow-engine.factory.ts  (334 B)
          workflow-engine.ts  (404 B)
      tests/
        runtime.test.ts  (4,396 B)
        architecture/
          agent-runtime.test.ts  (144 B)
          composition.test.ts  (1,663 B)
          diagnostics.test.ts  (136 B)
          error-manager.test.ts  (144 B)
          event-dispatcher.test.ts  (4,255 B)
          execution-aggregate.test.ts  (4,131 B)
          execution-engine.test.ts  (2,887 B)
          execution-flow.test.ts  (4,203 B)
          helpers.ts  (276 B)
          lifecycle-manager.test.ts  (2,806 B)
          pipeline-coordinator.test.ts  (515 B)
          pipeline-engine.test.ts  (15,633 B)
          state-manager.test.ts  (1,821 B)
          task-scheduler.test.ts  (132 B)
          workflow-engine.test.ts  (150 B)
    sdk/
      CHANGELOG.md  (1,439 B)
      README.md  (2,793 B)
      package.json  (1,109 B)
      tsconfig.json  (154 B)
      vitest.config.ts  (414 B)
      docs/
        .gitkeep  (0 B)
      scripts/
        verify-atlas41-chat-data-entry.mjs  (9,438 B)
        verify-atlas41-live.mjs  (9,960 B)
        verify-atlas42-live.mjs  (7,740 B)
      src/
        index.ts  (4,573 B)
        adapters/
          workflow-projection-adapter.ts  (3,276 B)
        atlas/
          atlas.ts  (2,209 B)
          options.ts  (1,704 B)
        context/
          atlas-context-builder.ts  (12,241 B)
          brand-context.ts  (239 B)
          context-limits.ts  (704 B)
          context-text.ts  (839 B)
          index.ts  (649 B)
        contracts/
          .gitkeep  (0 B)
        feedback/
          feedback-types.ts  (1,355 B)
          index.ts  (513 B)
          parse-warranty-correction.ts  (1,161 B)
          record-feedback-correction.ts  (7,276 B)
        governance/
          action-operational-result.ts  (6,921 B)
          constants.ts  (584 B)
          governance-events.ts  (1,380 B)
          governance-gate.ts  (4,168 B)
          governance-types.ts  (1,787 B)
          internal-action-executor.ts  (2,889 B)
        internal/
          .gitkeep  (0 B)
        knowledge/
          ingest-document.ts  (2,477 B)
        modules/
          compiler-module.ts  (2,399 B)
          events-module.ts  (1,412 B)
          governance-module.ts  (5,121 B)
          llm-module.ts  (5,069 B)
          memory-module.ts  (8,007 B)
          org-memory-module.ts  (5,425 B)
          planning-module.ts  (1,234 B)
          retrieval-module.ts  (2,162 B)
          runtime-module.ts  (1,276 B)
          workflow-module.ts  (1,447 B)
        org/
          constants.ts  (1,761 B)
          decision-answer.ts  (1,870 B)
          decision-resolver.ts  (2,357 B)
          decision-store.ts  (3,120 B)
          entity-resolver.ts  (5,437 B)
          entity-store.ts  (5,699 B)
          fixtures.ts  (3,073 B)
          graph-traversal.ts  (1,753 B)
          org-llm-tools.ts  (17,795 B)
          policy-answer.ts  (2,271 B)
          policy-evaluator.ts  (3,637 B)
          record-content.ts  (2,819 B)
          relationship-store.ts  (2,430 B)
          version-resolver.ts  (3,440 B)
          schemas/
            approval-rule.ts  (1,190 B)
            client.ts  (1,021 B)
            decision.ts  (3,166 B)
            discount-policy.ts  (1,224 B)
            evidence.ts  (1,816 B)
            warranty-policy.ts  (1,194 B)
        plan/
          plan-execution-memory.ts  (3,245 B)
        retrieval/
          retrieval-content-search.ts  (1,965 B)
        tools/
          atlas-tool-registry.ts  (4,695 B)
      tests/
        action-result-memory-closure.test.ts  (18,974 B)
        atlas-context-builder.test.ts  (8,183 B)
        atlas-org-module.test.ts  (1,130 B)
        atlas.test.ts  (5,171 B)
        feedback-memory-retrieval-closure.test.ts  (21,599 B)
        governance-gate.test.ts  (17,152 B)
        knowledge-ingest-integration.test.ts  (7,506 B)
        knowledge-integration.test.ts  (3,577 B)
        llm-module.test.ts  (22,890 B)
        llm-org-integration.test.ts  (13,781 B)
        memory-list-records.test.ts  (6,273 B)
        memory-module.test.ts  (3,351 B)
        memory-persistence.test.ts  (916 B)
        org-decision-resolver.test.ts  (2,286 B)
        org-decision-schemas.test.ts  (1,500 B)
        org-decision-store.test.ts  (3,701 B)
        org-entity-resolver.test.ts  (2,958 B)
        org-entity-store.test.ts  (3,778 B)
        org-graph-traversal.test.ts  (2,624 B)
        org-policy-evaluator.test.ts  (1,685 B)
        org-version-resolver.test.ts  (1,652 B)
        plan-execution-memory.test.ts  (2,439 B)
        plan-integration.test.ts  (1,707 B)
        planning-module.test.ts  (1,061 B)
        retrieval-integration.test.ts  (2,571 B)
        retrieval-unification.test.ts  (7,748 B)
        workflow-module.test.ts  (1,882 B)
        workflow-projection-adapter.test.ts  (2,293 B)
    search/
      CHANGELOG.md  (83 B)
      README.md  (252 B)
      package.json  (558 B)
      tsconfig.json  (154 B)
      vitest.config.ts  (186 B)
      docs/
        .gitkeep  (0 B)
      src/
        index.ts  (96 B)
        contracts/
          .gitkeep  (0 B)
        internal/
          .gitkeep  (0 B)
      tests/
        smoke.test.ts  (164 B)
    validation/
      CHANGELOG.md  (87 B)
      README.md  (260 B)
      package.json  (566 B)
      tsconfig.json  (154 B)
      vitest.config.ts  (186 B)
      docs/
        .gitkeep  (0 B)
      src/
        index.ts  (100 B)
        contracts/
          .gitkeep  (0 B)
        internal/
          .gitkeep  (0 B)
      tests/
        smoke.test.ts  (168 B)
    workflow/
      CHANGELOG.md  (85 B)
      README.md  (256 B)
      package.json  (714 B)
      tsconfig.json  (154 B)
      vitest.config.ts  (414 B)
      docs/
        .gitkeep  (0 B)
      src/
        index.ts  (1,614 B)
        pipeline-definition.ts  (266 B)
        workflow-compiler.ts  (4,384 B)
        workflow-errors.ts  (1,169 B)
        workflow-factory.ts  (3,497 B)
        workflow-graph.ts  (6,387 B)
        workflow-model.ts  (2,561 B)
        workflow-registry.ts  (1,347 B)
        workflow-validator.ts  (5,426 B)
        contracts/
          .gitkeep  (0 B)
        internal/
          .gitkeep  (0 B)
      tests/
        workflow-definition.test.ts  (9,125 B)
  plugins/
    README.md  (238 B)
  releases/
    ATLAS-RELEASE-001-KERNEL_v0.1.md  (4,363 B)
    ATLAS_PILOT_EVIDENCE_BACKLOG.md  (4,216 B)
    ATLAS_PILOT_FEEDBACK.md  (3,471 B)
    ATLAS_PILOT_GO_NO_GO.md  (5,185 B)
    ATLAS_PILOT_PROTOCOL.md  (9,575 B)
    ATLAS_PILOT_READINESS_AUDIT.md  (13,531 B)
    COMANDOS_TERMINAL_ANTES_DE_3J.md  (1,843 B)
    CORE_IMPLEMENTATION_PLAN.md  (20,117 B)
    ESTADO_REAL_DEL_REPO.md  (3,335 B)
    IMPLEMENTATION_READINESS_REPORT.md  (16,847 B)
    INFORME-REVISION-ARQUITECTONICA.md  (22,558 B)
    KNOWLEDGE_IMPLEMENTATION_PLAN.md  (51,827 B)
    LLM_TOOL_RESULT_PRECEDENCE_FIX.md  (5,159 B)
    MANUAL_VALIDATION_REPORT_2026-08-09.md  (8,765 B)
    MEMORY_ARCHITECTURE_CONSISTENCY_REPORT.md  (30,337 B)
    MVP_IMPLEMENTATION_PLAN.md  (12,351 B)
    P2_1_LLM_ADAPTER_IMPLEMENTATION_PLAN.md  (19,264 B)
    P2_2_CONVERSACION_IMPLEMENTATION_PLAN.md  (14,401 B)
    P2_3_BRANDS_WORKSPACES_IMPLEMENTATION_PLAN.md  (14,306 B)
    P2_4_FEEDBACK_LOOP_IMPLEMENTATION_PLAN.md  (13,388 B)
    P2_5_FIX_CIRCULAR_DEPENDENCY.md  (5,311 B)
    P2_5_FIX_FEEDBACK_ORDER_FLAKY_TEST.md  (4,221 B)
    P2_5_WEB_UI_IMPLEMENTATION_PLAN.md  (731 B)
    PHASE_0_BOOTSTRAP_REPORT.md  (21,835 B)
    QUALITY_GATE_FIX_TYPECHECK_LINT.md  (4,404 B)
    RELEASE_READINESS_REPORT.md  (5,688 B)
    REPOSITORY_MIGRATION_PLAN.md  (20,137 B)
    REPOSITORY_MIGRATION_REPORT.md  (11,509 B)
    RESUMEN_TRABAJO_2026-08-11_a_2026-08-16.md  (10,536 B)
    RESUMEN_TRABAJO_2026-08-16_a_2026-08-17_ATLAS4.md  (12,960 B)
    RFC_ATLAS4_2_DECISION_EVIDENCE.md  (21,289 B)
    RFC_ATLAS4_ORGANIZATIONAL_INTELLIGENCE.md  (23,508 B)
    RUNTIME_IMPLEMENTATION_REVIEW.md  (26,118 B)
    SPRINT10F_ARCHITECTURE_REVIEW.md  (7,357 B)
    SPRINT11A_1_IMPLEMENTATION_PLAN.md  (16,315 B)
    SPRINT9_1_DOCUMENTATION_ALIGNMENT_REPORT.md  (5,810 B)
    SPRINT9_IMPLEMENTATION_REPORT.md  (7,243 B)
    SPRINT9_KNOWLEDGE_COMPILER_INTEGRATION.md  (17,417 B)
    SUPERPROMPT_ATLAS4_1_CHAT_DATA_ENTRY.md  (8,683 B)
    SUPERPROMPT_ATLAS4_1_VERTICAL_SLICE.md  (9,100 B)
    SUPERPROMPT_ATLAS4_1_WIRE_ORG_MODULE.md  (4,152 B)
    SUPERPROMPT_COMMIT_WIP_Y_LIMPIAR_MAIN.md  (1,747 B)
    SUPERPROMPT_EXCEL_KNOWLEDGE.md  (15,453 B)
    SUPERPROMPT_FASE_3J_EXCEL_MOTION_CORREGIDO.md  (25,723 B)
    SUPERPROMPT_FIX_COMMIT_INCOMPLETO.md  (4,279 B)
    SUPERPROMPT_FIX_KNOWLEDGE_STALE_CONTEXT_Y_BUSQUEDA.md  (9,235 B)
    SUPERPROMPT_FIX_TOKEN_HISTORY_WINDOW.md  (11,317 B)
    SUPERPROMPT_MERGE_FIX_KNOWLEDGE.md  (2,309 B)
    SUPERPROMPT_RFC_ATLAS4_ORGANIZATIONAL_INTELLIGENCE.md  (5,695 B)
    SUPERPROMPT_TERMINAR_WIP_BIBLIOTECA.md  (10,198 B)
    WEB_ATLAS4_1_VERTICAL_SLICE.md  (11,023 B)
    WEB_ATLAS4_2_DECISION_EVIDENCE.md  (4,103 B)
    WEB_TOKEN_HISTORY_WINDOW_FIX.md  (6,328 B)
    WEB_UI_AUDIT.md  (21,337 B)
    WEB_UI_CHAT_ENV_AND_ERROR_DISPLAY_FIX.md  (4,970 B)
    WEB_UI_CHAT_HISTORY_RELOAD_FIX.md  (4,731 B)
    WEB_UI_EXCEL_KNOWLEDGE_AUDIT.md  (17,007 B)
    WEB_UI_EXCEL_KNOWLEDGE_IMPLEMENTATION.md  (8,916 B)
    WEB_UI_KNOWLEDGE_LIBRARY_COMPLETION.md  (5,270 B)
    WEB_UI_KNOWLEDGE_UPLOAD_IMPLEMENTATION.md  (4,621 B)
    WEB_UI_KNOWLEDGE_UPLOAD_SPEC.md  (6,245 B)
    WEB_UI_LIVE_REVIEW_UX_FIXES.md  (2,439 B)
    WEB_UI_NAVIGATION_RENDER_LOOP_FIX.md  (4,312 B)
    WEB_UI_PHASE_3D_B_IMPLEMENTATION.md  (9,828 B)
    WEB_UI_PHASE_3E_IMPLEMENTATION.md  (7,414 B)
    WEB_UI_PHASE_3F_ACTIVITY_DESIGN.md  (7,173 B)
    WEB_UI_PHASE_3F_IMPLEMENTATION.md  (5,999 B)
    WEB_UI_PHASE_3G2_IMPLEMENTATION.md  (4,788 B)
    WEB_UI_PHASE_3G3_AUDIT.md  (18,062 B)
    WEB_UI_PHASE_3G3_IMPLEMENTATION.md  (6,314 B)
    WEB_UI_PHASE_3G4_AUDIT.md  (20,083 B)
    WEB_UI_PHASE_3G4_IMPLEMENTATION.md  (7,107 B)
    WEB_UI_PHASE_3H_AUDIT.md  (5,655 B)
    WEB_UI_PHASE_3H_IMPLEMENTATION.md  (5,838 B)
    WEB_UI_PHASE_3I_ACCESSIBILITY_RESPONSIVE_AUDIT.md  (20,732 B)
    WEB_UI_PHASE_3I_ACCESSIBILITY_RESPONSIVE_IMPLEMENTATION.md  (7,512 B)
    WEB_UI_PHASE_3_IMPLEMENTATION.md  (6,360 B)
    WEB_UI_POLISH_TOAST_SEND_DUPLICADO.md  (6,771 B)
    WEB_UI_THEME_SWITCH_AND_LIGHT_LOGO_FIX.md  (3,392 B)
    WEB_UI_UX_POLISH_SPEC.md  (8,251 B)
    WEB_UI_WORLD_CLASS_FINAL_AUDIT.md  (25,759 B)
    WEB_UI_WORLD_CLASS_PRODUCT_REVIEW.md  (29,608 B)
    WEB_UI_WORLD_CLASS_REVIEW.md  (28,637 B)
  scripts/
    README.md  (127 B)
    create-package-stubs.sh  (2,562 B)
    vitest.package.config.ts  (186 B)
  spec/
    architecture/
      ATLAS-ARCH-000-ARCHITECTURE_OVERVIEW.md  (7,687 B)
      ATLAS-ARCH-001-SYSTEM_ARCHITECTURE.md  (9,066 B)
      ATLAS-ARCH-002-PACKAGE_ARCHITECTURE.md  (12,669 B)
      ATLAS-ARCH-003-COMPILER_ARCHITECTURE.md  (15,468 B)
      ATLAS-ARCH-004-KNOWLEDGE_GRAPH_ARCHITECTURE.md  (12,913 B)
      ATLAS-ARCH-005-PLUGIN_ARCHITECTURE.md  (11,668 B)
      ATLAS-ARCH-006-BUILD_COMPILATION_PIPELINE.md  (13,222 B)
    capabilities/
      knowledge/
        KNOWLEDGE-001-CAPABILITY.md  (8,059 B)
        KNOWLEDGE-002-METAMODEL.md  (9,887 B)
        KNOWLEDGE-003-OBJECT_MODEL.md  (5,972 B)
        KNOWLEDGE-004-GRAPH_MODEL.md  (7,567 B)
        KNOWLEDGE-005-LIFECYCLE.md  (7,497 B)
        KNOWLEDGE-006-QUERY_MODEL.md  (6,868 B)
        KNOWLEDGE-007-OPERATIONS.md  (6,443 B)
        KNOWLEDGE-008-ROADMAP.md  (6,859 B)
    domain/
      ATLAS-DOM-000-DOMAIN_REVIEW.md  (12,082 B)
      ATLAS-DOM-001-KNOWLEDGE_DOMAIN.md  (11,335 B)
      ATLAS-DOM-002-ONTOLOGY_DOMAIN.md  (12,104 B)
      ATLAS-DOM-003-CONTEXT_DOMAIN.md  (12,958 B)
      ATLAS-DOM-004-MEMORY_DOMAIN.md  (13,312 B)
      ATLAS-DOM-005-RETRIEVAL_DOMAIN.md  (13,443 B)
      ATLAS-DOM-006-PROMPT_DOMAIN.md  (12,336 B)
      ATLAS-DOM-007-WORKFLOW_DOMAIN.md  (12,737 B)
      ATLAS-DOM-008-AGENT_DOMAIN.md  (12,819 B)
      ATLAS-DOM-009-RUNTIME_DOMAIN.md  (12,356 B)
    engine/
      ATLAS-100-ENGINE.md  (13,058 B)
      ATLAS-101-CONTEXT_ENGINE.md  (11,235 B)
      ATLAS-102-KNOWLEDGE_ENGINE.md  (9,333 B)
      ATLAS-103-MEMORY_ENGINE.md  (8,740 B)
      ATLAS-104-SEARCH_ENGINE.md  (8,351 B)
      ATLAS-105-RETRIEVAL_ENGINE.md  (9,065 B)
      ATLAS-106-PROMPT_ENGINE.md  (8,296 B)
      ATLAS-107-AGENT_RUNTIME.md  (8,558 B)
      ATLAS-108-WORKFLOW_ENGINE.md  (8,178 B)
      ATLAS-109-VALIDATION_ENGINE.md  (8,016 B)
      ATLAS-110-CONTEXT_PLANNER.md  (9,352 B)
    foundation/
      ATLAS-000-README.md  (12,708 B)
      ATLAS-001-MANIFESTO.md  (3,318 B)
      ATLAS-002-CONSTITUTION.md  (4,383 B)
      ATLAS-003-PRINCIPLES.md  (12,788 B)
      ATLAS-004-DOMAIN_MODEL.md  (13,227 B)
      ATLAS-005-BOUNDARIES.md  (11,540 B)
      ATLAS-006-GOVERNANCE.md  (10,730 B)
      ATLAS-007-DECISION_MODEL.md  (11,175 B)
      ATLAS-008-ONCOLOGY.md  (11,014 B)
      ATLAS-009-GLOSSARY.md  (10,120 B)
      ATLAS-010-PLATFORM_MAPPING.md  (7,904 B)
      ATLAS-012-REPOSITORY_GOVERNANCE.md  (8,851 B)
      ATLAS-013-NAMING_CONVENTIONS.md  (7,508 B)
    intelligence/
      ATLAS-INTELLIGENCE-001-VISION.md  (5,603 B)
      ATLAS-INTELLIGENCE-002-MEMORY.md  (5,551 B)
      ATLAS-INTELLIGENCE-003-RETRIEVAL.md  (4,940 B)
      ATLAS-INTELLIGENCE-004-CONTEXT.md  (4,770 B)
      ATLAS-INTELLIGENCE-005-REASONING.md  (4,970 B)
      ATLAS-INTELLIGENCE-006-PLANNING.md  (4,445 B)
      ATLAS-INTELLIGENCE-007-WORKFLOW.md  (4,730 B)
      ATLAS-INTELLIGENCE-008-AGENTS.md  (5,149 B)
      ATLAS-INTELLIGENCE-009-GOVERNANCE.md  (4,935 B)
      ATLAS-INTELLIGENCE-010-COGNITIVE_ARCHITECTURE.md  (5,724 B)
      ATLAS-INTELLIGENCE-011-INTELLIGENCE_ENGINE.md  (5,182 B)
      ATLAS-INTELLIGENCE-100-PUBLIC_API.md  (4,747 B)
      contracts/
        ATLAS-INTELLIGENCE-CONTRACT-001-CONTEXT_BUILDER.md  (4,903 B)
        ATLAS-INTELLIGENCE-CONTRACT-002-MEMORY_PROVIDER.md  (4,458 B)
        ATLAS-INTELLIGENCE-CONTRACT-003-RETRIEVAL_PROVIDER.md  (4,529 B)
        ATLAS-INTELLIGENCE-CONTRACT-004-REASONING_ENGINE.md  (4,815 B)
        ATLAS-INTELLIGENCE-CONTRACT-005-PLANNING_ENGINE.md  (4,479 B)
        ATLAS-INTELLIGENCE-CONTRACT-006-WORKFLOW_ENGINE.md  (4,413 B)
        ATLAS-INTELLIGENCE-CONTRACT-007-AGENT_RUNTIME.md  (4,440 B)
        ATLAS-INTELLIGENCE-CONTRACT-008-GOVERNANCE_PROVIDER.md  (4,861 B)
    memory/
      ATLAS-MEMORY-001-VISION.md  (7,095 B)
      ATLAS-MEMORY-002-ARCHITECTURE.md  (8,826 B)
      ATLAS-MEMORY-003-MEMORY_ENGINE.md  (8,029 B)
      ATLAS-MEMORY-004-STORAGE_MODEL.md  (8,033 B)
      ATLAS-MEMORY-005-RETRIEVAL.md  (7,833 B)
      ATLAS-MEMORY-006-INDEXING.md  (7,700 B)
      ATLAS-MEMORY-007-CONSISTENCY.md  (8,202 B)
      ATLAS-MEMORY-008-PUBLIC_API.md  (5,623 B)
      contracts/
        ATLAS-MEMORY-CONTRACT-001-MEMORY_ENGINE.md  (6,963 B)
        ATLAS-MEMORY-CONTRACT-002-STORAGE_PROVIDER.md  (4,807 B)
        ATLAS-MEMORY-CONTRACT-003-INDEX_PROVIDER.md  (4,937 B)
        ATLAS-MEMORY-CONTRACT-004-RETRIEVAL_PROVIDER.md  (5,002 B)
        ATLAS-MEMORY-CONTRACT-005-MEMORY_SESSION.md  (5,057 B)
        ATLAS-MEMORY-CONTRACT-006-CONSISTENCY_PROVIDER.md  (3,074 B)
        ATLAS-MEMORY-CONTRACT-007-MEMORY_STORE.md  (1,474 B)
        ATLAS-MEMORY-CONTRACT-008-MEMORY_QUERY.md  (1,507 B)
    product/
      ATLAS-002-CONCEPTUAL_MODEL.md  (8,951 B)
    reasoning/
      ATLAS-REASONING-001-DOMAIN.md  (4,466 B)
      ATLAS-REASONING-002-ARCHITECTURE.md  (5,554 B)
      ATLAS-REASONING-003-ENGINE.md  (4,615 B)
      ATLAS-REASONING-004-STRATEGIES.md  (4,483 B)
      ATLAS-REASONING-005-TRACE.md  (4,551 B)
      ATLAS-REASONING-006-CONFIDENCE.md  (4,849 B)
      ATLAS-REASONING-007-PUBLIC_API.md  (4,400 B)
      contracts/
        ATLAS-REASONING-CONTRACT-001-REASONING_ENGINE.md  (5,092 B)
        ATLAS-REASONING-CONTRACT-002-REASONING_STRATEGY.md  (6,491 B)
        ATLAS-REASONING-CONTRACT-003-STRATEGY_REGISTRY.md  (4,951 B)
        ATLAS-REASONING-CONTRACT-004-TRACE_PROVIDER.md  (5,235 B)
        ATLAS-REASONING-CONTRACT-005-CONFIDENCE_PROVIDER.md  (5,716 B)
        ATLAS-REASONING-CONTRACT-006-REQUEST_VALIDATOR.md  (5,194 B)
        ATLAS-REASONING-CONTRACT-007-RESULT_PROVIDER.md  (5,743 B)
        ATLAS-REASONING-CONTRACT-008-REASONING_SESSION.md  (5,910 B)
    runtime/
      ATLAS-RUNTIME-001-EXECUTION_MODEL.md  (4,397 B)
      ATLAS-RUNTIME-002-EVENT_MODEL.md  (4,203 B)
      ATLAS-RUNTIME-003-STATE_MODEL.md  (4,488 B)
      ATLAS-RUNTIME-004-TASK_MODEL.md  (4,270 B)
      ATLAS-RUNTIME-005-PIPELINE.md  (4,943 B)
      ATLAS-RUNTIME-006-LIFECYCLE.md  (4,490 B)
      ATLAS-RUNTIME-007-OBSERVABILITY.md  (4,671 B)
      ATLAS-RUNTIME-008-ERROR_MODEL.md  (4,367 B)
      ATLAS-RUNTIME-009-RUNTIME_ARCHITECTURE.md  (5,012 B)
      ATLAS-RUNTIME-100-PUBLIC_API.md  (4,315 B)
    sdk/
      ATLAS-200-SDK_OVERVIEW.md  (7,762 B)
      ATLAS-201-SDK_CLI.md  (8,601 B)
      ATLAS-202-SDK_TYPESCRIPT.md  (9,878 B)
      ATLAS-203-SDK_PYTHON.md  (10,442 B)
      ATLAS-204-SDK_EVENTS.md  (9,902 B)
      ATLAS-205-REST_API.md  (7,744 B)
      ATLAS-206-GRAPHQL_API.md  (7,328 B)
      ATLAS-207-WEBHOOKS.md  (7,377 B)
  templates/
    README.md  (154 B)
  tests/
    README.md  (160 B)
  tools/
    README.md  (148 B)
  workspaces/
    README.md  (530 B)
    first-atlas-workspace/
      GETTING_STARTED.md  (4,091 B)
      MILESTONE_1_UX_REVIEW.md  (4,681 B)
      README.md  (1,386 B)
      atlas.workspace.json  (2,239 B)
      package.json  (439 B)
      .atlas/
        README.md  (309 B)
      config/
        atlas.config.json  (436 B)
      docs/
        quickstart.md  (900 B)
      knowledge/
        README.md  (953 B)
        concepts/
          platform-overview.concept.json  (245 B)
        policies/
          access-control.policy.json  (267 B)
          data-retention.policy.json  (270 B)
      scripts/
        demo.sh  (523 B)
```

---

## Listado plano de rutas

```
.env
.env.example
.gitignore
.npmrc
.nvmrc
.prettierignore
.prettierrc
ATLAS_ARCHITECTURE_MASTER.md
ATLAS_PRODUCT_VISION_v1.0.md
ATLAS_ROADMAP_RECONCILIATION.md
PILOT_LOG.md
README.md
USER_MANUAL.md
VERSION.md
eslint.config.js
package.json
pnpm-lock.yaml
pnpm-workspace.yaml
tsconfig.base.json
tsconfig.json
turbo.json
.atlas/memory.json
.atlas/workspaces/geeks/knowledge-folders.json
.atlas/workspaces/geeks/memory.json
.atlas/workspaces/geeks/profile.json
.atlas/workspaces/geeks-banco-amazonas/memory.json
.atlas/workspaces/geeks-banco-amazonas/profile.json
.atlas/workspaces/verificacion-fix/memory.json
.atlas/workspaces/verificacion-fix/profile.json
.changeset/README.md
.changeset/config.json
.github/workflows/ci.yml
adr/ADR-0001-DOCUMENT_ID_NAMESPACE.md
adr/ADR-0002-PLANNING_CONSOLIDATION.md
adr/ADR-0003-MEMORY_ARCHITECTURE_RESOLUTION.md
adr/ADR-0004-EXECUTION-MODEL-AND-RUNTIME-OWNERSHIP.md
adr/ADR-0005-RETRIEVAL_ARCHITECTURE_RECONCILIATION.md
adr/README.md
apps/README.md
apps/web/index.html
apps/web/package.json
apps/web/tsconfig.json
apps/web/vite.config.ts
apps/web/vitest.config.ts
apps/web/.atlas/workspaces/geeks/activity.json
apps/web/.atlas/workspaces/geeks/conversation.json
apps/web/.atlas/workspaces/geeks/memory.json
apps/web/.atlas/workspaces/geeks/profile.json
apps/web/.atlas/workspaces/revital/conversation.json
apps/web/.atlas/workspaces/revital/profile.json
apps/web/design-system/.thumbnail
apps/web/design-system/SKILL.md
apps/web/design-system/_adherence.oxlintrc.json
apps/web/design-system/_ds_bundle.js
apps/web/design-system/_ds_manifest.json
apps/web/design-system/readme.md
apps/web/design-system/styles.css
apps/web/design-system/thumbnail.html
apps/web/design-system/assets/logo-alt.svg
apps/web/design-system/assets/logo.svg
apps/web/design-system/assets/fonts/Inter-Italic-VariableFont_opsz_wght.ttf
apps/web/design-system/assets/fonts/Sora-VariableFont_wght.ttf
apps/web/design-system/assets/reference/atlas-reference-sheet.png
apps/web/design-system/assets/reference/colores-atlas.png
apps/web/design-system/components/app/AppShell.d.ts
apps/web/design-system/components/app/AppShell.jsx
apps/web/design-system/components/app/AppShell.prompt.md
apps/web/design-system/components/app/Hero.d.ts
apps/web/design-system/components/app/Hero.jsx
apps/web/design-system/components/app/Hero.prompt.md
apps/web/design-system/components/app/Section.d.ts
apps/web/design-system/components/app/Section.jsx
apps/web/design-system/components/app/Section.prompt.md
apps/web/design-system/components/app/app.card.html
apps/web/design-system/components/chat/ChatComposer.d.ts
apps/web/design-system/components/chat/ChatComposer.jsx
apps/web/design-system/components/chat/ChatComposer.prompt.md
apps/web/design-system/components/chat/ConversationMessage.d.ts
apps/web/design-system/components/chat/ConversationMessage.jsx
apps/web/design-system/components/chat/ConversationMessage.prompt.md
apps/web/design-system/components/chat/chat.card.html
apps/web/design-system/components/core/Avatar.d.ts
apps/web/design-system/components/core/Avatar.jsx
apps/web/design-system/components/core/Avatar.prompt.md
apps/web/design-system/components/core/Badge.d.ts
apps/web/design-system/components/core/Badge.jsx
apps/web/design-system/components/core/Badge.prompt.md
apps/web/design-system/components/core/Button.d.ts
apps/web/design-system/components/core/Button.jsx
apps/web/design-system/components/core/Button.prompt.md
apps/web/design-system/components/core/Divider.d.ts
apps/web/design-system/components/core/Divider.jsx
apps/web/design-system/components/core/Divider.prompt.md
apps/web/design-system/components/core/IconButton.d.ts
apps/web/design-system/components/core/IconButton.jsx
apps/web/design-system/components/core/IconButton.prompt.md
apps/web/design-system/components/core/Status.d.ts
apps/web/design-system/components/core/Status.jsx
apps/web/design-system/components/core/Status.prompt.md
apps/web/design-system/components/core/core.card.html
apps/web/design-system/components/feedback/Alert.d.ts
apps/web/design-system/components/feedback/Alert.jsx
apps/web/design-system/components/feedback/Alert.prompt.md
apps/web/design-system/components/feedback/EmptyState.d.ts
apps/web/design-system/components/feedback/EmptyState.jsx
apps/web/design-system/components/feedback/EmptyState.prompt.md
apps/web/design-system/components/feedback/ErrorState.d.ts
apps/web/design-system/components/feedback/ErrorState.jsx
apps/web/design-system/components/feedback/ErrorState.prompt.md
apps/web/design-system/components/feedback/Skeleton.d.ts
apps/web/design-system/components/feedback/Skeleton.jsx
apps/web/design-system/components/feedback/Skeleton.prompt.md
apps/web/design-system/components/feedback/Toast.d.ts
apps/web/design-system/components/feedback/Toast.jsx
apps/web/design-system/components/feedback/Toast.prompt.md
apps/web/design-system/components/feedback/Tooltip.d.ts
apps/web/design-system/components/feedback/Tooltip.jsx
apps/web/design-system/components/feedback/Tooltip.prompt.md
apps/web/design-system/components/feedback/feedback.card.html
apps/web/design-system/components/forms/Input.d.ts
apps/web/design-system/components/forms/Input.jsx
apps/web/design-system/components/forms/Input.prompt.md
apps/web/design-system/components/forms/Listbox.d.ts
apps/web/design-system/components/forms/Listbox.jsx
apps/web/design-system/components/forms/Listbox.prompt.md
apps/web/design-system/components/forms/SearchInput.d.ts
apps/web/design-system/components/forms/SearchInput.jsx
apps/web/design-system/components/forms/SearchInput.prompt.md
apps/web/design-system/components/forms/Select.d.ts
apps/web/design-system/components/forms/Select.jsx
apps/web/design-system/components/forms/Select.prompt.md
apps/web/design-system/components/forms/Textarea.d.ts
apps/web/design-system/components/forms/Textarea.jsx
apps/web/design-system/components/forms/Textarea.prompt.md
apps/web/design-system/components/forms/forms.card.html
apps/web/design-system/components/navigation/BrandSelector.d.ts
apps/web/design-system/components/navigation/BrandSelector.jsx
apps/web/design-system/components/navigation/BrandSelector.prompt.md
apps/web/design-system/components/navigation/NavItem.d.ts
apps/web/design-system/components/navigation/NavItem.jsx
apps/web/design-system/components/navigation/NavItem.prompt.md
apps/web/design-system/components/navigation/Sidebar.d.ts
apps/web/design-system/components/navigation/Sidebar.jsx
apps/web/design-system/components/navigation/Sidebar.prompt.md
apps/web/design-system/components/navigation/TopBar.d.ts
apps/web/design-system/components/navigation/TopBar.jsx
apps/web/design-system/components/navigation/TopBar.prompt.md
apps/web/design-system/components/navigation/navigation.card.html
apps/web/design-system/components/overlays/Dialog.d.ts
apps/web/design-system/components/overlays/Dialog.jsx
apps/web/design-system/components/overlays/Dialog.prompt.md
apps/web/design-system/components/overlays/Popover.d.ts
apps/web/design-system/components/overlays/Popover.jsx
apps/web/design-system/components/overlays/Popover.prompt.md
apps/web/design-system/components/overlays/overlays.card.html
apps/web/design-system/components/surfaces/ActionCard.d.ts
apps/web/design-system/components/surfaces/ActionCard.jsx
apps/web/design-system/components/surfaces/ActionCard.prompt.md
apps/web/design-system/components/surfaces/ActivityItem.d.ts
apps/web/design-system/components/surfaces/ActivityItem.jsx
apps/web/design-system/components/surfaces/ActivityItem.prompt.md
apps/web/design-system/components/surfaces/BrandCard.d.ts
apps/web/design-system/components/surfaces/BrandCard.jsx
apps/web/design-system/components/surfaces/BrandCard.prompt.md
apps/web/design-system/components/surfaces/Card.d.ts
apps/web/design-system/components/surfaces/Card.jsx
apps/web/design-system/components/surfaces/Card.prompt.md
apps/web/design-system/components/surfaces/HistoryItem.d.ts
apps/web/design-system/components/surfaces/HistoryItem.jsx
apps/web/design-system/components/surfaces/HistoryItem.prompt.md
apps/web/design-system/components/surfaces/KnowledgeCard.d.ts
apps/web/design-system/components/surfaces/KnowledgeCard.jsx
apps/web/design-system/components/surfaces/KnowledgeCard.prompt.md
apps/web/design-system/components/surfaces/surfaces.card.html
apps/web/design-system/guidelines/brand-iconography.html
apps/web/design-system/guidelines/brand-isotipo.html
apps/web/design-system/guidelines/brand-logotipo.html
apps/web/design-system/guidelines/colors-light.html
apps/web/design-system/guidelines/colors-navy.html
apps/web/design-system/guidelines/colors-primary.html
apps/web/design-system/guidelines/colors-semantic.html
apps/web/design-system/guidelines/colors-text.html
apps/web/design-system/guidelines/spacing-radius.html
apps/web/design-system/guidelines/spacing-scale.html
apps/web/design-system/guidelines/type-body.html
apps/web/design-system/guidelines/type-display.html
apps/web/design-system/guidelines/type-eyebrow.html
apps/web/design-system/tokens/base.css
apps/web/design-system/tokens/colors.css
apps/web/design-system/tokens/fonts.css
apps/web/design-system/tokens/spacing.css
apps/web/design-system/tokens/typography.css
apps/web/design-system/ui_kits/atlas-web/ActivityScreen.jsx
apps/web/design-system/ui_kits/atlas-web/BrandsScreen.jsx
apps/web/design-system/ui_kits/atlas-web/ChatScreen.jsx
apps/web/design-system/ui_kits/atlas-web/HomeScreen.jsx
apps/web/design-system/ui_kits/atlas-web/IconRocket.jsx
apps/web/design-system/ui_kits/atlas-web/KnowledgeScreen.jsx
apps/web/design-system/ui_kits/atlas-web/index.html
apps/web/design-system/uploads/Inter-Italic-VariableFont_opsz,wght.ttf
apps/web/design-system/uploads/Sora-VariableFont_wght.ttf
apps/web/design-system/uploads/colores-ATLAS.png
apps/web/design-system/uploads/logo-ATLAS-negro.svg
apps/web/design-system/uploads/logo-atlas-black.svg
apps/web/src/config.ts
apps/web/src/server.ts
apps/web/src/session-store.ts
apps/web/src/client/app.ts
apps/web/src/client/main.ts
apps/web/src/client/api/client.ts
apps/web/src/client/components/brand-card.ts
apps/web/src/client/components/shell.ts
apps/web/src/client/lib/brand-catalog.ts
apps/web/src/client/lib/brand-context.ts
apps/web/src/client/lib/chat-reasoning.ts
apps/web/src/client/lib/copy-text.ts
apps/web/src/client/lib/dialog.ts
apps/web/src/client/lib/expandable-details.ts
apps/web/src/client/lib/format-chat-metrics.ts
apps/web/src/client/lib/history.ts
apps/web/src/client/lib/icons.ts
apps/web/src/client/lib/knowledge-duplicate-file-name.ts
apps/web/src/client/lib/markdown.ts
apps/web/src/client/lib/theme.ts
apps/web/src/client/lib/workspace-switch.ts
apps/web/src/client/pages/activity.ts
apps/web/src/client/pages/brands.ts
apps/web/src/client/pages/chat.ts
apps/web/src/client/pages/home.ts
apps/web/src/client/pages/knowledge.ts
apps/web/src/client/state/app-state.ts
apps/web/src/client/styles/app.css
apps/web/src/client/styles/tokens.css
apps/web/src/i18n/es.ts
apps/web/src/i18n/index.ts
apps/web/src/lib/format-atlas-error.ts
apps/web/src/lib/load-env.ts
apps/web/src/lib/knowledge-upload/chunk-excel.ts
apps/web/src/lib/knowledge-upload/chunk-text.ts
apps/web/src/lib/knowledge-upload/constants.ts
apps/web/src/lib/knowledge-upload/extract-excel.ts
apps/web/src/lib/knowledge-upload/extract-text.ts
apps/web/src/lib/knowledge-upload/folder.ts
apps/web/src/lib/knowledge-upload/knowledge-folders-store.ts
apps/web/src/lib/knowledge-upload/partition-upload-files.ts
apps/web/src/lib/knowledge-upload/upload-errors.ts
apps/web/src/lib/web-persistence/activity-store.ts
apps/web/src/lib/web-persistence/conversation-store.ts
apps/web/src/lib/web-persistence/governance-activity.ts
apps/web/src/lib/web-persistence/types.ts
apps/web/src/lib/web-persistence/workspace-storage-paths.ts
apps/web/src/presentation/brand-errors.ts
apps/web/src/presentation/format-error.ts
apps/web/src/presentation/map-activity.ts
apps/web/src/presentation/map-brand.ts
apps/web/src/presentation/map-chat-response.ts
apps/web/src/presentation/map-history.ts
apps/web/src/presentation/map-knowledge-documents.ts
apps/web/src/presentation/map-knowledge-folders.ts
apps/web/src/presentation/map-knowledge-upload.ts
apps/web/src/presentation/map-knowledge.ts
apps/web/tests/conversation-activity-persistence.test.ts
apps/web/tests/format-atlas-error.test.ts
apps/web/tests/knowledge-ingest-int003.test.ts
apps/web/tests/knowledge-upload.test.ts
apps/web/tests/server.test.ts
apps/web/tests/client/activity.test.ts
apps/web/tests/client/app-navigation.test.ts
apps/web/tests/client/app-state.test.ts
apps/web/tests/client/brand-switcher.test.ts
apps/web/tests/client/brands.test.ts
apps/web/tests/client/chat.test.ts
apps/web/tests/client/copy-text.test.ts
apps/web/tests/client/format-chat-metrics.test.ts
apps/web/tests/client/history.test.ts
apps/web/tests/client/home.test.ts
apps/web/tests/client/knowledge-duplicate-file-name.test.ts
apps/web/tests/client/knowledge.test.ts
apps/web/tests/client/markdown.test.ts
apps/web/tests/client/phase-3h.test.ts
apps/web/tests/client/phase-3i-accessibility.test.ts
apps/web/tests/client/shell.test.ts
apps/web/tests/client/theme.test.ts
apps/web/tests/client/workspace-switch.test.ts
apps/web/tests/fixtures/fixture-utils.ts
apps/web/tests/fixtures/sample.md
apps/web/tests/fixtures/sample.txt
apps/web/tests/i18n/index.test.ts
apps/web/tests/lib/chunk-excel.test.ts
apps/web/tests/lib/extract-excel.test.ts
apps/web/tests/lib/knowledge-folder.test.ts
apps/web/tests/lib/knowledge-folders-store.test.ts
apps/web/tests/lib/partition-upload-files.test.ts
apps/web/tests/presentation/format-error.test.ts
apps/web/tests/presentation/map-activity.test.ts
apps/web/tests/presentation/map-brand.test.ts
apps/web/tests/presentation/map-chat-response.test.ts
apps/web/tests/presentation/map-history.test.ts
apps/web/tests/presentation/map-knowledge-documents.test.ts
apps/web/tests/presentation/map-knowledge.test.ts
design/fonts/Inter/Inter-Italic-VariableFont_opsz,wght.ttf
design/fonts/Inter/Inter-VariableFont_opsz,wght.ttf
design/fonts/Inter/OFL.txt
design/fonts/Inter/README.txt
design/fonts/Inter/static/Inter_18pt-Black.ttf
design/fonts/Inter/static/Inter_18pt-BlackItalic.ttf
design/fonts/Inter/static/Inter_18pt-Bold.ttf
design/fonts/Inter/static/Inter_18pt-BoldItalic.ttf
design/fonts/Inter/static/Inter_18pt-ExtraBold.ttf
design/fonts/Inter/static/Inter_18pt-ExtraBoldItalic.ttf
design/fonts/Inter/static/Inter_18pt-ExtraLight.ttf
design/fonts/Inter/static/Inter_18pt-ExtraLightItalic.ttf
design/fonts/Inter/static/Inter_18pt-Italic.ttf
design/fonts/Inter/static/Inter_18pt-Light.ttf
design/fonts/Inter/static/Inter_18pt-LightItalic.ttf
design/fonts/Inter/static/Inter_18pt-Medium.ttf
design/fonts/Inter/static/Inter_18pt-MediumItalic.ttf
design/fonts/Inter/static/Inter_18pt-Regular.ttf
design/fonts/Inter/static/Inter_18pt-SemiBold.ttf
design/fonts/Inter/static/Inter_18pt-SemiBoldItalic.ttf
design/fonts/Inter/static/Inter_18pt-Thin.ttf
design/fonts/Inter/static/Inter_18pt-ThinItalic.ttf
design/fonts/Inter/static/Inter_24pt-Black.ttf
design/fonts/Inter/static/Inter_24pt-BlackItalic.ttf
design/fonts/Inter/static/Inter_24pt-Bold.ttf
design/fonts/Inter/static/Inter_24pt-BoldItalic.ttf
design/fonts/Inter/static/Inter_24pt-ExtraBold.ttf
design/fonts/Inter/static/Inter_24pt-ExtraBoldItalic.ttf
design/fonts/Inter/static/Inter_24pt-ExtraLight.ttf
design/fonts/Inter/static/Inter_24pt-ExtraLightItalic.ttf
design/fonts/Inter/static/Inter_24pt-Italic.ttf
design/fonts/Inter/static/Inter_24pt-Light.ttf
design/fonts/Inter/static/Inter_24pt-LightItalic.ttf
design/fonts/Inter/static/Inter_24pt-Medium.ttf
design/fonts/Inter/static/Inter_24pt-MediumItalic.ttf
design/fonts/Inter/static/Inter_24pt-Regular.ttf
design/fonts/Inter/static/Inter_24pt-SemiBold.ttf
design/fonts/Inter/static/Inter_24pt-SemiBoldItalic.ttf
design/fonts/Inter/static/Inter_24pt-Thin.ttf
design/fonts/Inter/static/Inter_24pt-ThinItalic.ttf
design/fonts/Inter/static/Inter_28pt-Black.ttf
design/fonts/Inter/static/Inter_28pt-BlackItalic.ttf
design/fonts/Inter/static/Inter_28pt-Bold.ttf
design/fonts/Inter/static/Inter_28pt-BoldItalic.ttf
design/fonts/Inter/static/Inter_28pt-ExtraBold.ttf
design/fonts/Inter/static/Inter_28pt-ExtraBoldItalic.ttf
design/fonts/Inter/static/Inter_28pt-ExtraLight.ttf
design/fonts/Inter/static/Inter_28pt-ExtraLightItalic.ttf
design/fonts/Inter/static/Inter_28pt-Italic.ttf
design/fonts/Inter/static/Inter_28pt-Light.ttf
design/fonts/Inter/static/Inter_28pt-LightItalic.ttf
design/fonts/Inter/static/Inter_28pt-Medium.ttf
design/fonts/Inter/static/Inter_28pt-MediumItalic.ttf
design/fonts/Inter/static/Inter_28pt-Regular.ttf
design/fonts/Inter/static/Inter_28pt-SemiBold.ttf
design/fonts/Inter/static/Inter_28pt-SemiBoldItalic.ttf
design/fonts/Inter/static/Inter_28pt-Thin.ttf
design/fonts/Inter/static/Inter_28pt-ThinItalic.ttf
design/fonts/Sora/OFL.txt
design/fonts/Sora/README.txt
design/fonts/Sora/Sora-VariableFont_wght.ttf
design/fonts/Sora/static/Sora-Bold.ttf
design/fonts/Sora/static/Sora-ExtraBold.ttf
design/fonts/Sora/static/Sora-ExtraLight.ttf
design/fonts/Sora/static/Sora-Light.ttf
design/fonts/Sora/static/Sora-Medium.ttf
design/fonts/Sora/static/Sora-Regular.ttf
design/fonts/Sora/static/Sora-SemiBold.ttf
design/fonts/Sora/static/Sora-Thin.ttf
docs/README.md
docs/WEB_UI_PRODUCT_UX.md
docs/guides/VERIFICATION_PLAYBOOK.md
docs/proposals/rfc/RFC-0001-repository-architecture.md
examples/README.md
examples/cli-workspace-demo/README.md
examples/cli-workspace-demo/atlas.workspace.json
examples/cli-workspace-demo/package.json
examples/compiler-events-demo/README.md
examples/compiler-events-demo/package.json
examples/compiler-events-demo/run.ts
examples/compiler-in-memory-demo/README.md
examples/compiler-in-memory-demo/package.json
examples/compiler-in-memory-demo/run.ts
examples/knowledge-compiler-demo/package.json
examples/knowledge-compiler-demo/run.ts
examples/runtime-demo/README.md
examples/runtime-demo/package.json
examples/runtime-demo/run.ts
examples/sdk-demo/README.md
examples/sdk-demo/package.json
examples/sdk-demo/run.ts
packages/agent/CHANGELOG.md
packages/agent/README.md
packages/agent/package.json
packages/agent/tsconfig.json
packages/agent/vitest.config.ts
packages/agent/docs/.gitkeep
packages/agent/src/index.ts
packages/agent/src/contracts/.gitkeep
packages/agent/src/internal/.gitkeep
packages/agent/tests/smoke.test.ts
packages/cli/CHANGELOG.md
packages/cli/README.md
packages/cli/package.json
packages/cli/tsconfig.json
packages/cli/vitest.config.ts
packages/cli/docs/.gitkeep
packages/cli/src/index.ts
packages/cli/src/application/cli-app.ts
packages/cli/src/application/container.ts
packages/cli/src/bin/atlas.ts
packages/cli/src/chat/chat-repl.ts
packages/cli/src/chat/chat-session.ts
packages/cli/src/chat/chat-turn.ts
packages/cli/src/chat/feedback.ts
packages/cli/src/chat/map-reasoning-steps.ts
packages/cli/src/commands/ask-command.ts
packages/cli/src/commands/brand-command.ts
packages/cli/src/commands/chat-command.ts
packages/cli/src/commands/compile-command.ts
packages/cli/src/commands/doctor-command.ts
packages/cli/src/commands/memory-command.ts
packages/cli/src/commands/plan-command.ts
packages/cli/src/commands/run-command.ts
packages/cli/src/commands/version-command.ts
packages/cli/src/commands/web-command.ts
packages/cli/src/configuration/workspace-config.ts
packages/cli/src/configuration/workspace-loader.ts
packages/cli/src/contracts/.gitkeep
packages/cli/src/internal/.gitkeep
packages/cli/src/output/exit-codes.ts
packages/cli/src/output/renderer.ts
packages/cli/src/registry/command-registry.ts
packages/cli/src/services/atlas-service.ts
packages/cli/src/workspace/brand-profile.ts
packages/cli/src/workspace/feedback-context.ts
packages/cli/tests/atlas-service.test.ts
packages/cli/tests/brand-command.test.ts
packages/cli/tests/brand-profile.test.ts
packages/cli/tests/chat-repl.test.ts
packages/cli/tests/chat-session.test.ts
packages/cli/tests/chat-turn.test.ts
packages/cli/tests/cli.test.ts
packages/cli/tests/dev-bootstrap.test.ts
packages/cli/tests/feedback-context.test.ts
packages/cli/tests/map-reasoning-steps.test.ts
packages/cli/tests/web-command.test.ts
packages/cli/tests/workspace-config.test.ts
packages/compiler/CHANGELOG.md
packages/compiler/README.md
packages/compiler/package.json
packages/compiler/tsconfig.json
packages/compiler/vitest.config.ts
packages/compiler/docs/.gitkeep
packages/compiler/src/index.ts
packages/compiler/src/compiler/atlas-compiler.ts
packages/compiler/src/context/artifact.ts
packages/compiler/src/context/compilation-context.ts
packages/compiler/src/context/compilation-unit.ts
packages/compiler/src/context/diagnostic.ts
packages/compiler/src/context/knowledge.ts
packages/compiler/src/contracts/.gitkeep
packages/compiler/src/contracts/artifact.ts
packages/compiler/src/contracts/compilation-context.ts
packages/compiler/src/contracts/compilation-lifecycle.ts
packages/compiler/src/contracts/compilation-result.ts
packages/compiler/src/contracts/compilation-unit.ts
packages/compiler/src/contracts/compiler-pipeline.ts
packages/compiler/src/contracts/compiler-stage-id.ts
packages/compiler/src/contracts/compiler-stage.ts
packages/compiler/src/contracts/compiler.ts
packages/compiler/src/contracts/diagnostic.ts
packages/compiler/src/contracts/generator.ts
packages/compiler/src/contracts/index.ts
packages/compiler/src/contracts/knowledge-graph.ts
packages/compiler/src/contracts/knowledge-node.ts
packages/compiler/src/contracts/publisher.ts
packages/compiler/src/internal/.gitkeep
packages/compiler/src/internal/diagnostics.ts
packages/compiler/src/pipeline/default-pipeline.ts
packages/compiler/src/pipeline/default-stages.ts
packages/compiler/src/pipeline/define-stage.ts
packages/compiler/src/registries/generator-registry.ts
packages/compiler/src/registries/publisher-registry.ts
packages/compiler/tests/context.test.ts
packages/compiler/tests/contracts.test.ts
packages/compiler/tests/events.test.ts
packages/compiler/tests/pipeline.test.ts
packages/compiler/tests/registries.test.ts
packages/context/CHANGELOG.md
packages/context/README.md
packages/context/package.json
packages/context/tsconfig.json
packages/context/vitest.config.ts
packages/context/docs/.gitkeep
packages/context/src/index.ts
packages/context/src/contracts/.gitkeep
packages/context/src/internal/.gitkeep
packages/context/tests/smoke.test.ts
packages/context-planner/CHANGELOG.md
packages/context-planner/README.md
packages/context-planner/package.json
packages/context-planner/tsconfig.json
packages/context-planner/vitest.config.ts
packages/context-planner/docs/.gitkeep
packages/context-planner/src/index.ts
packages/context-planner/src/contracts/.gitkeep
packages/context-planner/src/internal/.gitkeep
packages/context-planner/tests/smoke.test.ts
packages/core/CHANGELOG.md
packages/core/README.md
packages/core/package.json
packages/core/tsconfig.json
packages/core/vitest.config.ts
packages/core/docs/.gitkeep
packages/core/src/index.ts
packages/core/src/result.ts
packages/core/src/timestamp.ts
packages/core/src/trace-id.ts
packages/core/src/contracts/.gitkeep
packages/core/src/contracts/configuration.ts
packages/core/src/contracts/context.ts
packages/core/src/contracts/event.ts
packages/core/src/contracts/index.ts
packages/core/src/contracts/input.ts
packages/core/src/contracts/metadata.ts
packages/core/src/contracts/metrics.ts
packages/core/src/contracts/module-contract.ts
packages/core/src/contracts/output.ts
packages/core/src/contracts/request.ts
packages/core/src/contracts/status.ts
packages/core/src/errors/atlas-error.ts
packages/core/src/errors/create-error.ts
packages/core/src/errors/index.ts
packages/core/src/errors/severity.ts
packages/core/src/internal/.gitkeep
packages/core/src/internal/deep-freeze.ts
packages/core/src/text/fold-diacritics.ts
packages/core/src/types/identifier.ts
packages/core/src/types/index.ts
packages/core/src/types/metadata.ts
packages/core/src/types/namespace.ts
packages/core/src/types/version.ts
packages/core/tests/contracts.test.ts
packages/core/tests/errors.test.ts
packages/core/tests/fold-diacritics.test.ts
packages/core/tests/primitives.test.ts
packages/core/tests/types.test.ts
packages/events/CHANGELOG.md
packages/events/README.md
packages/events/package.json
packages/events/tsconfig.json
packages/events/vitest.config.ts
packages/events/docs/.gitkeep
packages/events/src/index.ts
packages/events/src/bus/in-memory-event-bus.ts
packages/events/src/contracts/.gitkeep
packages/events/src/contracts/event-definition.ts
packages/events/src/contracts/event.ts
packages/events/src/definitions/compiler-completed.ts
packages/events/src/event/create-event.ts
packages/events/src/event/define-event.ts
packages/events/src/internal/.gitkeep
packages/events/src/publisher/event-publisher.ts
packages/events/tests/bus.test.ts
packages/events/tests/event.test.ts
packages/graph/CHANGELOG.md
packages/graph/README.md
packages/graph/package.json
packages/graph/tsconfig.json
packages/graph/vitest.config.ts
packages/graph/docs/.gitkeep
packages/graph/src/index.ts
packages/graph/src/contracts/.gitkeep
packages/graph/src/internal/.gitkeep
packages/graph/tests/smoke.test.ts
packages/intelligence/package.json
packages/intelligence/tsconfig.json
packages/intelligence/vitest.config.ts
packages/intelligence/src/goal-normalizer.ts
packages/intelligence/src/index.ts
packages/intelligence/src/planning-compiler.ts
packages/intelligence/src/planning-engine.ts
packages/intelligence/src/planning-errors.ts
packages/intelligence/src/planning-model.ts
packages/intelligence/src/planning-registry.ts
packages/intelligence/src/planning-strategies.ts
packages/intelligence/src/planning-validator.ts
packages/intelligence/src/workflow-builder.ts
packages/intelligence/tests/planning-engine.test.ts
packages/knowledge/CHANGELOG.md
packages/knowledge/README.md
packages/knowledge/package.json
packages/knowledge/tsconfig.json
packages/knowledge/vitest.config.ts
packages/knowledge/docs/.gitkeep
packages/knowledge/src/index.ts
packages/knowledge/src/adapters/canonical-source.ts
packages/knowledge/src/adapters/index.ts
packages/knowledge/src/adapters/knowledge-projection-adapter.ts
packages/knowledge/src/adapters/knowledge-projection-error.ts
packages/knowledge/src/adapters/projection-types.ts
packages/knowledge/src/contracts/.gitkeep
packages/knowledge/src/domain/aggregates/knowledge-object.ts
packages/knowledge/src/domain/entities/knowledge-relationship.ts
packages/knowledge/src/domain/entities/knowledge-statement.ts
packages/knowledge/src/domain/value-objects/context-scope.ts
packages/knowledge/src/domain/value-objects/governance-record.ts
packages/knowledge/src/domain/value-objects/index.ts
packages/knowledge/src/domain/value-objects/knowledge-object-id.ts
packages/knowledge/src/domain/value-objects/knowledge-typed-id.ts
packages/knowledge/src/domain/value-objects/knowledge-version.ts
packages/knowledge/src/domain/value-objects/lifecycle-state.ts
packages/knowledge/src/domain/value-objects/object-behavior.ts
packages/knowledge/src/domain/value-objects/object-kind.ts
packages/knowledge/src/domain/value-objects/object-metadata.ts
packages/knowledge/src/domain/value-objects/relationship-id.ts
packages/knowledge/src/domain/value-objects/relationship-type.ts
packages/knowledge/src/domain/value-objects/statement-content.ts
packages/knowledge/src/domain/value-objects/statement-id.ts
packages/knowledge/src/domain/value-objects/trust-score.ts
packages/knowledge/src/errors/create-knowledge-error.ts
packages/knowledge/src/factories/index.ts
packages/knowledge/src/ingest/document-ingest.ts
packages/knowledge/src/internal/.gitkeep
packages/knowledge/src/metamodel/extension-model.ts
packages/knowledge/src/metamodel/index.ts
packages/knowledge/src/metamodel/meta-concept-descriptor.ts
packages/knowledge/src/metamodel/meta-concept-id.ts
packages/knowledge/src/metamodel/meta-concept-registry.ts
packages/knowledge/src/metamodel/meta-layer.ts
packages/knowledge/src/metamodel/metamodel-invariants.ts
packages/knowledge/src/validators/context-validator.ts
packages/knowledge/src/validators/identity-validator.ts
packages/knowledge/src/validators/index.ts
packages/knowledge/src/validators/knowledge-object-validator.ts
packages/knowledge/src/validators/metamodel-validator.ts
packages/knowledge/src/validators/relationship-validator.ts
packages/knowledge/src/validators/statement-validator.ts
packages/knowledge/tests/adapters/knowledge-projection-adapter.test.ts
packages/knowledge/tests/domain/domain-core.test.ts
packages/knowledge/tests/factories/factories.test.ts
packages/knowledge/tests/ingest/document-ingest.test.ts
packages/knowledge/tests/metamodel/metamodel.test.ts
packages/knowledge/tests/validators/validators-extended.test.ts
packages/knowledge/tests/validators/validators.test.ts
packages/llm/README.md
packages/llm/package.json
packages/llm/tsconfig.json
packages/llm/vitest.config.ts
packages/llm/src/budget.ts
packages/llm/src/index.ts
packages/llm/src/provider.ts
packages/llm/src/tool-loop.ts
packages/llm/src/providers/anthropic-provider.ts
packages/llm/src/providers/fake-provider.ts
packages/llm/src/providers/openai-compatible-provider.ts
packages/llm/tests/anthropic-provider.test.ts
packages/llm/tests/openai-compatible-provider.test.ts
packages/llm/tests/tool-loop.test.ts
packages/memory/CHANGELOG.md
packages/memory/README.md
packages/memory/package.json
packages/memory/tsconfig.json
packages/memory/vitest.config.ts
packages/memory/docs/.gitkeep
packages/memory/src/index.ts
packages/memory/src/application/index.ts
packages/memory/src/application/request-validation.ts
packages/memory/src/application/contracts/DeleteMemoryRequest.ts
packages/memory/src/application/contracts/RetrieveMemoryRequest.ts
packages/memory/src/application/contracts/SearchMemoryRequest.ts
packages/memory/src/application/contracts/StoreMemoryRequest.ts
packages/memory/src/application/contracts/UpdateMemoryRequest.ts
packages/memory/src/application/errors/ApplicationError.ts
packages/memory/src/application/responses/DeleteMemoryResponse.ts
packages/memory/src/application/responses/RetrieveMemoryResponse.ts
packages/memory/src/application/responses/SearchMemoryResponse.ts
packages/memory/src/application/responses/StoreMemoryResponse.ts
packages/memory/src/application/responses/UpdateMemoryResponse.ts
packages/memory/src/application/use-cases/DeleteMemoryUseCase.ts
packages/memory/src/application/use-cases/RetrieveMemoryUseCase.ts
packages/memory/src/application/use-cases/SearchMemoryUseCase.ts
packages/memory/src/application/use-cases/StoreMemoryUseCase.ts
packages/memory/src/application/use-cases/UpdateMemoryUseCase.ts
packages/memory/src/contracts/.gitkeep
packages/memory/src/domain/index.ts
packages/memory/src/domain/aggregates/memory-session-aggregate.ts
packages/memory/src/domain/aggregates/record-aggregate.ts
packages/memory/src/domain/constants/memory-constants.ts
packages/memory/src/domain/constants/memory-session-lifecycle.ts
packages/memory/src/domain/constants/memory-session-operations.ts
packages/memory/src/domain/constants/storage-constraints.ts
packages/memory/src/domain/entities/collection.ts
packages/memory/src/domain/entities/namespace.ts
packages/memory/src/domain/entities/record.ts
packages/memory/src/domain/entities/relationship.ts
packages/memory/src/domain/entities/version.ts
packages/memory/src/domain/errors/create-memory-error.ts
packages/memory/src/domain/errors/memory-error-codes.ts
packages/memory/src/domain/factories/memory-factories.ts
packages/memory/src/domain/factories/memory-session-factories.ts
packages/memory/src/domain/interfaces/consistency-provider.ts
packages/memory/src/domain/interfaces/memory-store.ts
packages/memory/src/domain/types/memory-session-types.ts
packages/memory/src/domain/types/memory-types.ts
packages/memory/src/domain/validators/memory-session-validators.ts
packages/memory/src/domain/validators/memory-validators.ts
packages/memory/src/domain/value-objects/checksum.ts
packages/memory/src/domain/value-objects/collection-id.ts
packages/memory/src/domain/value-objects/collection-type.ts
packages/memory/src/domain/value-objects/execution-id.ts
packages/memory/src/domain/value-objects/index.ts
packages/memory/src/domain/value-objects/memory-metadata.ts
packages/memory/src/domain/value-objects/memory-operation-id.ts
packages/memory/src/domain/value-objects/memory-operation-type.ts
packages/memory/src/domain/value-objects/memory-session-context.ts
packages/memory/src/domain/value-objects/memory-session-id.ts
packages/memory/src/domain/value-objects/memory-session-metadata.ts
packages/memory/src/domain/value-objects/memory-session-revision.ts
packages/memory/src/domain/value-objects/memory-session-status.ts
packages/memory/src/domain/value-objects/memory-typed-id.ts
packages/memory/src/domain/value-objects/namespace-id.ts
packages/memory/src/domain/value-objects/namespace-type.ts
packages/memory/src/domain/value-objects/record-id.ts
packages/memory/src/domain/value-objects/record-status.ts
packages/memory/src/domain/value-objects/record-type.ts
packages/memory/src/domain/value-objects/relationship-id.ts
packages/memory/src/domain/value-objects/relationship-type.ts
packages/memory/src/domain/value-objects/revision-number.ts
packages/memory/src/domain/value-objects/version-id.ts
packages/memory/src/domain/value-objects/visibility.ts
packages/memory/src/engine/MemoryEngine.ts
packages/memory/src/engine/create-memory-engine.ts
packages/memory/src/engine/engine-errors.ts
packages/memory/src/engine/engine-requests.ts
packages/memory/src/engine/index.ts
packages/memory/src/engine/memory-engine-consistency.ts
packages/memory/src/engine/memory-engine-session-orchestrator.ts
packages/memory/src/engine/memory-engine-session-registry.ts
packages/memory/src/engine/memory-engine-session-validation.ts
packages/memory/src/internal/.gitkeep
packages/memory/src/internal/engine-query-validation.ts
packages/memory/src/internal/memory-record-update.ts
packages/memory/src/internal/query-executor.ts
packages/memory/src/internal/result.ts
packages/memory/src/internal/store-gateway.ts
packages/memory/src/providers/create-memory-providers.ts
packages/memory/src/providers/index/in-memory-index-provider.ts
packages/memory/src/providers/index/index-provider.ts
packages/memory/src/providers/retrieval/in-memory-retrieval-provider.ts
packages/memory/src/providers/retrieval/retrieval-provider.ts
packages/memory/src/providers/storage/create-json-file-memory-engine.ts
packages/memory/src/providers/storage/in-memory-storage-provider.ts
packages/memory/src/providers/storage/json-file-storage-provider.ts
packages/memory/src/providers/storage/legacy-memory-store-storage-adapter.ts
packages/memory/src/providers/storage/memory-store-from-storage-provider.ts
packages/memory/src/providers/storage/storage-provider.ts
packages/memory/src/repositories/CollectionRepository.ts
packages/memory/src/repositories/NamespaceRepository.ts
packages/memory/src/repositories/RecordRepository.ts
packages/memory/src/repositories/RelationshipRepository.ts
packages/memory/src/repositories/VersionRepository.ts
packages/memory/src/repositories/repository-errors.ts
packages/memory/src/repositories/repository-projections.ts
packages/memory/src/repositories/repository-store.ts
packages/memory/tests/public-api.test.ts
packages/memory/tests/smoke.test.ts
packages/memory/tests/application/application-error.test.ts
packages/memory/tests/application/architecture-boundaries.test.ts
packages/memory/tests/application/delete-memory-use-case.test.ts
packages/memory/tests/application/request-validation.test.ts
packages/memory/tests/application/retrieve-memory-use-case.test.ts
packages/memory/tests/application/search-memory-use-case.test.ts
packages/memory/tests/application/store-memory-use-case.test.ts
packages/memory/tests/application/test-helpers.ts
packages/memory/tests/application/update-memory-use-case.test.ts
packages/memory/tests/domain/domain-core.test.ts
packages/memory/tests/domain/memory-session.test.ts
packages/memory/tests/engine/json-file-memory-engine.test.ts
packages/memory/tests/engine/memory-engine-operations.test.ts
packages/memory/tests/engine/memory-engine-providers.test.ts
packages/memory/tests/engine/memory-engine-session.test.ts
packages/memory/tests/engine/memory-engine.test.ts
packages/memory/tests/providers/index-provider.test.ts
packages/memory/tests/providers/json-file-storage-provider.test.ts
packages/memory/tests/providers/retrieval-provider.test.ts
packages/memory/tests/providers/storage-provider.test.ts
packages/memory/tests/repositories/memory-repositories.test.ts
packages/memory/tests/support/memory-store-test-support.ts
packages/ontology/CHANGELOG.md
packages/ontology/README.md
packages/ontology/package.json
packages/ontology/tsconfig.json
packages/ontology/vitest.config.ts
packages/ontology/docs/.gitkeep
packages/ontology/src/index.ts
packages/ontology/src/contracts/.gitkeep
packages/ontology/src/internal/.gitkeep
packages/ontology/tests/smoke.test.ts
packages/plugin/CHANGELOG.md
packages/plugin/README.md
packages/plugin/package.json
packages/plugin/tsconfig.json
packages/plugin/vitest.config.ts
packages/plugin/docs/.gitkeep
packages/plugin/src/index.ts
packages/plugin/src/contracts/.gitkeep
packages/plugin/src/internal/.gitkeep
packages/plugin/tests/smoke.test.ts
packages/prompt/CHANGELOG.md
packages/prompt/README.md
packages/prompt/package.json
packages/prompt/tsconfig.json
packages/prompt/vitest.config.ts
packages/prompt/docs/.gitkeep
packages/prompt/src/index.ts
packages/prompt/src/contracts/.gitkeep
packages/prompt/src/internal/.gitkeep
packages/prompt/tests/smoke.test.ts
packages/publisher/CHANGELOG.md
packages/publisher/README.md
packages/publisher/package.json
packages/publisher/tsconfig.json
packages/publisher/vitest.config.ts
packages/publisher/docs/.gitkeep
packages/publisher/src/index.ts
packages/publisher/src/contracts/.gitkeep
packages/publisher/src/internal/.gitkeep
packages/publisher/tests/smoke.test.ts
packages/retrieval/CHANGELOG.md
packages/retrieval/README.md
packages/retrieval/package.json
packages/retrieval/tsconfig.json
packages/retrieval/vitest.config.ts
packages/retrieval/docs/.gitkeep
packages/retrieval/src/index.ts
packages/retrieval/src/retrieval-pipeline.ts
packages/retrieval/src/contracts/.gitkeep
packages/retrieval/src/internal/.gitkeep
packages/retrieval/tests/retrieval-pipeline.test.ts
packages/runtime/CHANGELOG.md
packages/runtime/README.md
packages/runtime/package.json
packages/runtime/tsconfig.json
packages/runtime/vitest.config.ts
packages/runtime/docs/.gitkeep
packages/runtime/src/index.ts
packages/runtime/src/agents/agent-runtime.factory.ts
packages/runtime/src/agents/agent-runtime.ts
packages/runtime/src/agents/index.ts
packages/runtime/src/agents/types.ts
packages/runtime/src/api/diagnostics-api.ts
packages/runtime/src/api/event-api.ts
packages/runtime/src/api/execution-api.ts
packages/runtime/src/api/index.ts
packages/runtime/src/api/lifecycle-api.ts
packages/runtime/src/api/task-api.ts
packages/runtime/src/api/workflow-api.ts
packages/runtime/src/compat/index.ts
packages/runtime/src/compat/legacy-atlas-runtime.ts
packages/runtime/src/composition/component-registry.ts
packages/runtime/src/composition/create-runtime-composition.ts
packages/runtime/src/composition/index.ts
packages/runtime/src/composition/runtime-dependencies.ts
packages/runtime/src/composition/runtime-public-api.ts
packages/runtime/src/context/execution-context.ts
packages/runtime/src/contracts/.gitkeep
packages/runtime/src/contracts/artifact-executor.ts
packages/runtime/src/contracts/execution-context.ts
packages/runtime/src/contracts/execution-output.ts
packages/runtime/src/contracts/execution-result.ts
packages/runtime/src/contracts/runtime-lifecycle.ts
packages/runtime/src/contracts/runtime.ts
packages/runtime/src/definitions/execution-events.ts
packages/runtime/src/definitions/runtime-completed.ts
packages/runtime/src/definitions/runtime-started.ts
packages/runtime/src/diagnostics/diagnostics.factory.ts
packages/runtime/src/diagnostics/diagnostics.ts
packages/runtime/src/diagnostics/index.ts
packages/runtime/src/diagnostics/types.ts
packages/runtime/src/engine/execution-aggregate.ts
packages/runtime/src/engine/execution-engine.factory.ts
packages/runtime/src/engine/execution-engine.ts
packages/runtime/src/engine/execution-flow.ts
packages/runtime/src/engine/execution-repository.ts
packages/runtime/src/engine/index.ts
packages/runtime/src/engine/types.ts
packages/runtime/src/errors/error-manager.factory.ts
packages/runtime/src/errors/error-manager.ts
packages/runtime/src/errors/index.ts
packages/runtime/src/errors/types.ts
packages/runtime/src/events/event-dispatcher.factory.ts
packages/runtime/src/events/event-dispatcher.ts
packages/runtime/src/events/index.ts
packages/runtime/src/events/types.ts
packages/runtime/src/executors/default-executors.ts
packages/runtime/src/internal/.gitkeep
packages/runtime/src/lifecycle/index.ts
packages/runtime/src/lifecycle/lifecycle-manager.factory.ts
packages/runtime/src/lifecycle/lifecycle-manager.ts
packages/runtime/src/lifecycle/transitions.ts
packages/runtime/src/lifecycle/types.ts
packages/runtime/src/pipeline/index.ts
packages/runtime/src/pipeline/pipeline-coordinator.factory.ts
packages/runtime/src/pipeline/pipeline-coordinator.ts
packages/runtime/src/pipeline/pipeline-events.ts
packages/runtime/src/pipeline/pipeline-executor.ts
packages/runtime/src/pipeline/pipeline-factory.ts
packages/runtime/src/pipeline/pipeline-model.ts
packages/runtime/src/pipeline/pipeline-projection.ts
packages/runtime/src/pipeline/pipeline-registry.ts
packages/runtime/src/pipeline/pipeline-stage.ts
packages/runtime/src/pipeline/pipeline.ts
packages/runtime/src/pipeline/types.ts
packages/runtime/src/registries/executor-registry.ts
packages/runtime/src/runtime/atlas-runtime.ts
packages/runtime/src/state/index.ts
packages/runtime/src/state/state-manager.factory.ts
packages/runtime/src/state/state-manager.ts
packages/runtime/src/state/types.ts
packages/runtime/src/tasks/index.ts
packages/runtime/src/tasks/task-scheduler.factory.ts
packages/runtime/src/tasks/task-scheduler.ts
packages/runtime/src/tasks/types.ts
packages/runtime/src/workflow/index.ts
packages/runtime/src/workflow/types.ts
packages/runtime/src/workflow/workflow-engine.factory.ts
packages/runtime/src/workflow/workflow-engine.ts
packages/runtime/tests/runtime.test.ts
packages/runtime/tests/architecture/agent-runtime.test.ts
packages/runtime/tests/architecture/composition.test.ts
packages/runtime/tests/architecture/diagnostics.test.ts
packages/runtime/tests/architecture/error-manager.test.ts
packages/runtime/tests/architecture/event-dispatcher.test.ts
packages/runtime/tests/architecture/execution-aggregate.test.ts
packages/runtime/tests/architecture/execution-engine.test.ts
packages/runtime/tests/architecture/execution-flow.test.ts
packages/runtime/tests/architecture/helpers.ts
packages/runtime/tests/architecture/lifecycle-manager.test.ts
packages/runtime/tests/architecture/pipeline-coordinator.test.ts
packages/runtime/tests/architecture/pipeline-engine.test.ts
packages/runtime/tests/architecture/state-manager.test.ts
packages/runtime/tests/architecture/task-scheduler.test.ts
packages/runtime/tests/architecture/workflow-engine.test.ts
packages/sdk/CHANGELOG.md
packages/sdk/README.md
packages/sdk/package.json
packages/sdk/tsconfig.json
packages/sdk/vitest.config.ts
packages/sdk/docs/.gitkeep
packages/sdk/scripts/verify-atlas41-chat-data-entry.mjs
packages/sdk/scripts/verify-atlas41-live.mjs
packages/sdk/scripts/verify-atlas42-live.mjs
packages/sdk/src/index.ts
packages/sdk/src/adapters/workflow-projection-adapter.ts
packages/sdk/src/atlas/atlas.ts
packages/sdk/src/atlas/options.ts
packages/sdk/src/context/atlas-context-builder.ts
packages/sdk/src/context/brand-context.ts
packages/sdk/src/context/context-limits.ts
packages/sdk/src/context/context-text.ts
packages/sdk/src/context/index.ts
packages/sdk/src/contracts/.gitkeep
packages/sdk/src/feedback/feedback-types.ts
packages/sdk/src/feedback/index.ts
packages/sdk/src/feedback/parse-warranty-correction.ts
packages/sdk/src/feedback/record-feedback-correction.ts
packages/sdk/src/governance/action-operational-result.ts
packages/sdk/src/governance/constants.ts
packages/sdk/src/governance/governance-events.ts
packages/sdk/src/governance/governance-gate.ts
packages/sdk/src/governance/governance-types.ts
packages/sdk/src/governance/internal-action-executor.ts
packages/sdk/src/internal/.gitkeep
packages/sdk/src/knowledge/ingest-document.ts
packages/sdk/src/modules/compiler-module.ts
packages/sdk/src/modules/events-module.ts
packages/sdk/src/modules/governance-module.ts
packages/sdk/src/modules/llm-module.ts
packages/sdk/src/modules/memory-module.ts
packages/sdk/src/modules/org-memory-module.ts
packages/sdk/src/modules/planning-module.ts
packages/sdk/src/modules/retrieval-module.ts
packages/sdk/src/modules/runtime-module.ts
packages/sdk/src/modules/workflow-module.ts
packages/sdk/src/org/constants.ts
packages/sdk/src/org/decision-answer.ts
packages/sdk/src/org/decision-resolver.ts
packages/sdk/src/org/decision-store.ts
packages/sdk/src/org/entity-resolver.ts
packages/sdk/src/org/entity-store.ts
packages/sdk/src/org/fixtures.ts
packages/sdk/src/org/graph-traversal.ts
packages/sdk/src/org/org-llm-tools.ts
packages/sdk/src/org/policy-answer.ts
packages/sdk/src/org/policy-evaluator.ts
packages/sdk/src/org/record-content.ts
packages/sdk/src/org/relationship-store.ts
packages/sdk/src/org/version-resolver.ts
packages/sdk/src/org/schemas/approval-rule.ts
packages/sdk/src/org/schemas/client.ts
packages/sdk/src/org/schemas/decision.ts
packages/sdk/src/org/schemas/discount-policy.ts
packages/sdk/src/org/schemas/evidence.ts
packages/sdk/src/org/schemas/warranty-policy.ts
packages/sdk/src/plan/plan-execution-memory.ts
packages/sdk/src/retrieval/retrieval-content-search.ts
packages/sdk/src/tools/atlas-tool-registry.ts
packages/sdk/tests/action-result-memory-closure.test.ts
packages/sdk/tests/atlas-context-builder.test.ts
packages/sdk/tests/atlas-org-module.test.ts
packages/sdk/tests/atlas.test.ts
packages/sdk/tests/feedback-memory-retrieval-closure.test.ts
packages/sdk/tests/governance-gate.test.ts
packages/sdk/tests/knowledge-ingest-integration.test.ts
packages/sdk/tests/knowledge-integration.test.ts
packages/sdk/tests/llm-module.test.ts
packages/sdk/tests/llm-org-integration.test.ts
packages/sdk/tests/memory-list-records.test.ts
packages/sdk/tests/memory-module.test.ts
packages/sdk/tests/memory-persistence.test.ts
packages/sdk/tests/org-decision-resolver.test.ts
packages/sdk/tests/org-decision-schemas.test.ts
packages/sdk/tests/org-decision-store.test.ts
packages/sdk/tests/org-entity-resolver.test.ts
packages/sdk/tests/org-entity-store.test.ts
packages/sdk/tests/org-graph-traversal.test.ts
packages/sdk/tests/org-policy-evaluator.test.ts
packages/sdk/tests/org-version-resolver.test.ts
packages/sdk/tests/plan-execution-memory.test.ts
packages/sdk/tests/plan-integration.test.ts
packages/sdk/tests/planning-module.test.ts
packages/sdk/tests/retrieval-integration.test.ts
packages/sdk/tests/retrieval-unification.test.ts
packages/sdk/tests/workflow-module.test.ts
packages/sdk/tests/workflow-projection-adapter.test.ts
packages/search/CHANGELOG.md
packages/search/README.md
packages/search/package.json
packages/search/tsconfig.json
packages/search/vitest.config.ts
packages/search/docs/.gitkeep
packages/search/src/index.ts
packages/search/src/contracts/.gitkeep
packages/search/src/internal/.gitkeep
packages/search/tests/smoke.test.ts
packages/validation/CHANGELOG.md
packages/validation/README.md
packages/validation/package.json
packages/validation/tsconfig.json
packages/validation/vitest.config.ts
packages/validation/docs/.gitkeep
packages/validation/src/index.ts
packages/validation/src/contracts/.gitkeep
packages/validation/src/internal/.gitkeep
packages/validation/tests/smoke.test.ts
packages/workflow/CHANGELOG.md
packages/workflow/README.md
packages/workflow/package.json
packages/workflow/tsconfig.json
packages/workflow/vitest.config.ts
packages/workflow/docs/.gitkeep
packages/workflow/src/index.ts
packages/workflow/src/pipeline-definition.ts
packages/workflow/src/workflow-compiler.ts
packages/workflow/src/workflow-errors.ts
packages/workflow/src/workflow-factory.ts
packages/workflow/src/workflow-graph.ts
packages/workflow/src/workflow-model.ts
packages/workflow/src/workflow-registry.ts
packages/workflow/src/workflow-validator.ts
packages/workflow/src/contracts/.gitkeep
packages/workflow/src/internal/.gitkeep
packages/workflow/tests/workflow-definition.test.ts
plugins/README.md
releases/ATLAS-RELEASE-001-KERNEL_v0.1.md
releases/ATLAS_PILOT_EVIDENCE_BACKLOG.md
releases/ATLAS_PILOT_FEEDBACK.md
releases/ATLAS_PILOT_GO_NO_GO.md
releases/ATLAS_PILOT_PROTOCOL.md
releases/ATLAS_PILOT_READINESS_AUDIT.md
releases/COMANDOS_TERMINAL_ANTES_DE_3J.md
releases/CORE_IMPLEMENTATION_PLAN.md
releases/ESTADO_REAL_DEL_REPO.md
releases/IMPLEMENTATION_READINESS_REPORT.md
releases/INFORME-REVISION-ARQUITECTONICA.md
releases/KNOWLEDGE_IMPLEMENTATION_PLAN.md
releases/LLM_TOOL_RESULT_PRECEDENCE_FIX.md
releases/MANUAL_VALIDATION_REPORT_2026-08-09.md
releases/MEMORY_ARCHITECTURE_CONSISTENCY_REPORT.md
releases/MVP_IMPLEMENTATION_PLAN.md
releases/P2_1_LLM_ADAPTER_IMPLEMENTATION_PLAN.md
releases/P2_2_CONVERSACION_IMPLEMENTATION_PLAN.md
releases/P2_3_BRANDS_WORKSPACES_IMPLEMENTATION_PLAN.md
releases/P2_4_FEEDBACK_LOOP_IMPLEMENTATION_PLAN.md
releases/P2_5_FIX_CIRCULAR_DEPENDENCY.md
releases/P2_5_FIX_FEEDBACK_ORDER_FLAKY_TEST.md
releases/P2_5_WEB_UI_IMPLEMENTATION_PLAN.md
releases/PHASE_0_BOOTSTRAP_REPORT.md
releases/QUALITY_GATE_FIX_TYPECHECK_LINT.md
releases/RELEASE_READINESS_REPORT.md
releases/REPOSITORY_MIGRATION_PLAN.md
releases/REPOSITORY_MIGRATION_REPORT.md
releases/RESUMEN_TRABAJO_2026-08-11_a_2026-08-16.md
releases/RESUMEN_TRABAJO_2026-08-16_a_2026-08-17_ATLAS4.md
releases/RFC_ATLAS4_2_DECISION_EVIDENCE.md
releases/RFC_ATLAS4_ORGANIZATIONAL_INTELLIGENCE.md
releases/RUNTIME_IMPLEMENTATION_REVIEW.md
releases/SPRINT10F_ARCHITECTURE_REVIEW.md
releases/SPRINT11A_1_IMPLEMENTATION_PLAN.md
releases/SPRINT9_1_DOCUMENTATION_ALIGNMENT_REPORT.md
releases/SPRINT9_IMPLEMENTATION_REPORT.md
releases/SPRINT9_KNOWLEDGE_COMPILER_INTEGRATION.md
releases/SUPERPROMPT_ATLAS4_1_CHAT_DATA_ENTRY.md
releases/SUPERPROMPT_ATLAS4_1_VERTICAL_SLICE.md
releases/SUPERPROMPT_ATLAS4_1_WIRE_ORG_MODULE.md
releases/SUPERPROMPT_COMMIT_WIP_Y_LIMPIAR_MAIN.md
releases/SUPERPROMPT_EXCEL_KNOWLEDGE.md
releases/SUPERPROMPT_FASE_3J_EXCEL_MOTION_CORREGIDO.md
releases/SUPERPROMPT_FIX_COMMIT_INCOMPLETO.md
releases/SUPERPROMPT_FIX_KNOWLEDGE_STALE_CONTEXT_Y_BUSQUEDA.md
releases/SUPERPROMPT_FIX_TOKEN_HISTORY_WINDOW.md
releases/SUPERPROMPT_MERGE_FIX_KNOWLEDGE.md
releases/SUPERPROMPT_RFC_ATLAS4_ORGANIZATIONAL_INTELLIGENCE.md
releases/SUPERPROMPT_TERMINAR_WIP_BIBLIOTECA.md
releases/WEB_ATLAS4_1_VERTICAL_SLICE.md
releases/WEB_ATLAS4_2_DECISION_EVIDENCE.md
releases/WEB_TOKEN_HISTORY_WINDOW_FIX.md
releases/WEB_UI_AUDIT.md
releases/WEB_UI_CHAT_ENV_AND_ERROR_DISPLAY_FIX.md
releases/WEB_UI_CHAT_HISTORY_RELOAD_FIX.md
releases/WEB_UI_EXCEL_KNOWLEDGE_AUDIT.md
releases/WEB_UI_EXCEL_KNOWLEDGE_IMPLEMENTATION.md
releases/WEB_UI_KNOWLEDGE_LIBRARY_COMPLETION.md
releases/WEB_UI_KNOWLEDGE_UPLOAD_IMPLEMENTATION.md
releases/WEB_UI_KNOWLEDGE_UPLOAD_SPEC.md
releases/WEB_UI_LIVE_REVIEW_UX_FIXES.md
releases/WEB_UI_NAVIGATION_RENDER_LOOP_FIX.md
releases/WEB_UI_PHASE_3D_B_IMPLEMENTATION.md
releases/WEB_UI_PHASE_3E_IMPLEMENTATION.md
releases/WEB_UI_PHASE_3F_ACTIVITY_DESIGN.md
releases/WEB_UI_PHASE_3F_IMPLEMENTATION.md
releases/WEB_UI_PHASE_3G2_IMPLEMENTATION.md
releases/WEB_UI_PHASE_3G3_AUDIT.md
releases/WEB_UI_PHASE_3G3_IMPLEMENTATION.md
releases/WEB_UI_PHASE_3G4_AUDIT.md
releases/WEB_UI_PHASE_3G4_IMPLEMENTATION.md
releases/WEB_UI_PHASE_3H_AUDIT.md
releases/WEB_UI_PHASE_3H_IMPLEMENTATION.md
releases/WEB_UI_PHASE_3I_ACCESSIBILITY_RESPONSIVE_AUDIT.md
releases/WEB_UI_PHASE_3I_ACCESSIBILITY_RESPONSIVE_IMPLEMENTATION.md
releases/WEB_UI_PHASE_3_IMPLEMENTATION.md
releases/WEB_UI_POLISH_TOAST_SEND_DUPLICADO.md
releases/WEB_UI_THEME_SWITCH_AND_LIGHT_LOGO_FIX.md
releases/WEB_UI_UX_POLISH_SPEC.md
releases/WEB_UI_WORLD_CLASS_FINAL_AUDIT.md
releases/WEB_UI_WORLD_CLASS_PRODUCT_REVIEW.md
releases/WEB_UI_WORLD_CLASS_REVIEW.md
scripts/README.md
scripts/create-package-stubs.sh
scripts/vitest.package.config.ts
spec/architecture/ATLAS-ARCH-000-ARCHITECTURE_OVERVIEW.md
spec/architecture/ATLAS-ARCH-001-SYSTEM_ARCHITECTURE.md
spec/architecture/ATLAS-ARCH-002-PACKAGE_ARCHITECTURE.md
spec/architecture/ATLAS-ARCH-003-COMPILER_ARCHITECTURE.md
spec/architecture/ATLAS-ARCH-004-KNOWLEDGE_GRAPH_ARCHITECTURE.md
spec/architecture/ATLAS-ARCH-005-PLUGIN_ARCHITECTURE.md
spec/architecture/ATLAS-ARCH-006-BUILD_COMPILATION_PIPELINE.md
spec/capabilities/knowledge/KNOWLEDGE-001-CAPABILITY.md
spec/capabilities/knowledge/KNOWLEDGE-002-METAMODEL.md
spec/capabilities/knowledge/KNOWLEDGE-003-OBJECT_MODEL.md
spec/capabilities/knowledge/KNOWLEDGE-004-GRAPH_MODEL.md
spec/capabilities/knowledge/KNOWLEDGE-005-LIFECYCLE.md
spec/capabilities/knowledge/KNOWLEDGE-006-QUERY_MODEL.md
spec/capabilities/knowledge/KNOWLEDGE-007-OPERATIONS.md
spec/capabilities/knowledge/KNOWLEDGE-008-ROADMAP.md
spec/domain/ATLAS-DOM-000-DOMAIN_REVIEW.md
spec/domain/ATLAS-DOM-001-KNOWLEDGE_DOMAIN.md
spec/domain/ATLAS-DOM-002-ONTOLOGY_DOMAIN.md
spec/domain/ATLAS-DOM-003-CONTEXT_DOMAIN.md
spec/domain/ATLAS-DOM-004-MEMORY_DOMAIN.md
spec/domain/ATLAS-DOM-005-RETRIEVAL_DOMAIN.md
spec/domain/ATLAS-DOM-006-PROMPT_DOMAIN.md
spec/domain/ATLAS-DOM-007-WORKFLOW_DOMAIN.md
spec/domain/ATLAS-DOM-008-AGENT_DOMAIN.md
spec/domain/ATLAS-DOM-009-RUNTIME_DOMAIN.md
spec/engine/ATLAS-100-ENGINE.md
spec/engine/ATLAS-101-CONTEXT_ENGINE.md
spec/engine/ATLAS-102-KNOWLEDGE_ENGINE.md
spec/engine/ATLAS-103-MEMORY_ENGINE.md
spec/engine/ATLAS-104-SEARCH_ENGINE.md
spec/engine/ATLAS-105-RETRIEVAL_ENGINE.md
spec/engine/ATLAS-106-PROMPT_ENGINE.md
spec/engine/ATLAS-107-AGENT_RUNTIME.md
spec/engine/ATLAS-108-WORKFLOW_ENGINE.md
spec/engine/ATLAS-109-VALIDATION_ENGINE.md
spec/engine/ATLAS-110-CONTEXT_PLANNER.md
spec/foundation/ATLAS-000-README.md
spec/foundation/ATLAS-001-MANIFESTO.md
spec/foundation/ATLAS-002-CONSTITUTION.md
spec/foundation/ATLAS-003-PRINCIPLES.md
spec/foundation/ATLAS-004-DOMAIN_MODEL.md
spec/foundation/ATLAS-005-BOUNDARIES.md
spec/foundation/ATLAS-006-GOVERNANCE.md
spec/foundation/ATLAS-007-DECISION_MODEL.md
spec/foundation/ATLAS-008-ONCOLOGY.md
spec/foundation/ATLAS-009-GLOSSARY.md
spec/foundation/ATLAS-010-PLATFORM_MAPPING.md
spec/foundation/ATLAS-012-REPOSITORY_GOVERNANCE.md
spec/foundation/ATLAS-013-NAMING_CONVENTIONS.md
spec/intelligence/ATLAS-INTELLIGENCE-001-VISION.md
spec/intelligence/ATLAS-INTELLIGENCE-002-MEMORY.md
spec/intelligence/ATLAS-INTELLIGENCE-003-RETRIEVAL.md
spec/intelligence/ATLAS-INTELLIGENCE-004-CONTEXT.md
spec/intelligence/ATLAS-INTELLIGENCE-005-REASONING.md
spec/intelligence/ATLAS-INTELLIGENCE-006-PLANNING.md
spec/intelligence/ATLAS-INTELLIGENCE-007-WORKFLOW.md
spec/intelligence/ATLAS-INTELLIGENCE-008-AGENTS.md
spec/intelligence/ATLAS-INTELLIGENCE-009-GOVERNANCE.md
spec/intelligence/ATLAS-INTELLIGENCE-010-COGNITIVE_ARCHITECTURE.md
spec/intelligence/ATLAS-INTELLIGENCE-011-INTELLIGENCE_ENGINE.md
spec/intelligence/ATLAS-INTELLIGENCE-100-PUBLIC_API.md
spec/intelligence/contracts/ATLAS-INTELLIGENCE-CONTRACT-001-CONTEXT_BUILDER.md
spec/intelligence/contracts/ATLAS-INTELLIGENCE-CONTRACT-002-MEMORY_PROVIDER.md
spec/intelligence/contracts/ATLAS-INTELLIGENCE-CONTRACT-003-RETRIEVAL_PROVIDER.md
spec/intelligence/contracts/ATLAS-INTELLIGENCE-CONTRACT-004-REASONING_ENGINE.md
spec/intelligence/contracts/ATLAS-INTELLIGENCE-CONTRACT-005-PLANNING_ENGINE.md
spec/intelligence/contracts/ATLAS-INTELLIGENCE-CONTRACT-006-WORKFLOW_ENGINE.md
spec/intelligence/contracts/ATLAS-INTELLIGENCE-CONTRACT-007-AGENT_RUNTIME.md
spec/intelligence/contracts/ATLAS-INTELLIGENCE-CONTRACT-008-GOVERNANCE_PROVIDER.md
spec/memory/ATLAS-MEMORY-001-VISION.md
spec/memory/ATLAS-MEMORY-002-ARCHITECTURE.md
spec/memory/ATLAS-MEMORY-003-MEMORY_ENGINE.md
spec/memory/ATLAS-MEMORY-004-STORAGE_MODEL.md
spec/memory/ATLAS-MEMORY-005-RETRIEVAL.md
spec/memory/ATLAS-MEMORY-006-INDEXING.md
spec/memory/ATLAS-MEMORY-007-CONSISTENCY.md
spec/memory/ATLAS-MEMORY-008-PUBLIC_API.md
spec/memory/contracts/ATLAS-MEMORY-CONTRACT-001-MEMORY_ENGINE.md
spec/memory/contracts/ATLAS-MEMORY-CONTRACT-002-STORAGE_PROVIDER.md
spec/memory/contracts/ATLAS-MEMORY-CONTRACT-003-INDEX_PROVIDER.md
spec/memory/contracts/ATLAS-MEMORY-CONTRACT-004-RETRIEVAL_PROVIDER.md
spec/memory/contracts/ATLAS-MEMORY-CONTRACT-005-MEMORY_SESSION.md
spec/memory/contracts/ATLAS-MEMORY-CONTRACT-006-CONSISTENCY_PROVIDER.md
spec/memory/contracts/ATLAS-MEMORY-CONTRACT-007-MEMORY_STORE.md
spec/memory/contracts/ATLAS-MEMORY-CONTRACT-008-MEMORY_QUERY.md
spec/product/ATLAS-002-CONCEPTUAL_MODEL.md
spec/reasoning/ATLAS-REASONING-001-DOMAIN.md
spec/reasoning/ATLAS-REASONING-002-ARCHITECTURE.md
spec/reasoning/ATLAS-REASONING-003-ENGINE.md
spec/reasoning/ATLAS-REASONING-004-STRATEGIES.md
spec/reasoning/ATLAS-REASONING-005-TRACE.md
spec/reasoning/ATLAS-REASONING-006-CONFIDENCE.md
spec/reasoning/ATLAS-REASONING-007-PUBLIC_API.md
spec/reasoning/contracts/ATLAS-REASONING-CONTRACT-001-REASONING_ENGINE.md
spec/reasoning/contracts/ATLAS-REASONING-CONTRACT-002-REASONING_STRATEGY.md
spec/reasoning/contracts/ATLAS-REASONING-CONTRACT-003-STRATEGY_REGISTRY.md
spec/reasoning/contracts/ATLAS-REASONING-CONTRACT-004-TRACE_PROVIDER.md
spec/reasoning/contracts/ATLAS-REASONING-CONTRACT-005-CONFIDENCE_PROVIDER.md
spec/reasoning/contracts/ATLAS-REASONING-CONTRACT-006-REQUEST_VALIDATOR.md
spec/reasoning/contracts/ATLAS-REASONING-CONTRACT-007-RESULT_PROVIDER.md
spec/reasoning/contracts/ATLAS-REASONING-CONTRACT-008-REASONING_SESSION.md
spec/runtime/ATLAS-RUNTIME-001-EXECUTION_MODEL.md
spec/runtime/ATLAS-RUNTIME-002-EVENT_MODEL.md
spec/runtime/ATLAS-RUNTIME-003-STATE_MODEL.md
spec/runtime/ATLAS-RUNTIME-004-TASK_MODEL.md
spec/runtime/ATLAS-RUNTIME-005-PIPELINE.md
spec/runtime/ATLAS-RUNTIME-006-LIFECYCLE.md
spec/runtime/ATLAS-RUNTIME-007-OBSERVABILITY.md
spec/runtime/ATLAS-RUNTIME-008-ERROR_MODEL.md
spec/runtime/ATLAS-RUNTIME-009-RUNTIME_ARCHITECTURE.md
spec/runtime/ATLAS-RUNTIME-100-PUBLIC_API.md
spec/sdk/ATLAS-200-SDK_OVERVIEW.md
spec/sdk/ATLAS-201-SDK_CLI.md
spec/sdk/ATLAS-202-SDK_TYPESCRIPT.md
spec/sdk/ATLAS-203-SDK_PYTHON.md
spec/sdk/ATLAS-204-SDK_EVENTS.md
spec/sdk/ATLAS-205-REST_API.md
spec/sdk/ATLAS-206-GRAPHQL_API.md
spec/sdk/ATLAS-207-WEBHOOKS.md
templates/README.md
tests/README.md
tools/README.md
workspaces/README.md
workspaces/first-atlas-workspace/GETTING_STARTED.md
workspaces/first-atlas-workspace/MILESTONE_1_UX_REVIEW.md
workspaces/first-atlas-workspace/README.md
workspaces/first-atlas-workspace/atlas.workspace.json
workspaces/first-atlas-workspace/package.json
workspaces/first-atlas-workspace/.atlas/README.md
workspaces/first-atlas-workspace/config/atlas.config.json
workspaces/first-atlas-workspace/docs/quickstart.md
workspaces/first-atlas-workspace/knowledge/README.md
workspaces/first-atlas-workspace/knowledge/concepts/platform-overview.concept.json
workspaces/first-atlas-workspace/knowledge/policies/access-control.policy.json
workspaces/first-atlas-workspace/knowledge/policies/data-retention.policy.json
workspaces/first-atlas-workspace/scripts/demo.sh
```
