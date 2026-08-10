/* @ds-bundle: {"format":4,"namespace":"ATLASDesignSystem_46b296","components":[{"name":"AppShell","sourcePath":"components/app/AppShell.jsx"},{"name":"Hero","sourcePath":"components/app/Hero.jsx"},{"name":"Section","sourcePath":"components/app/Section.jsx"},{"name":"ChatComposer","sourcePath":"components/chat/ChatComposer.jsx"},{"name":"ConversationMessage","sourcePath":"components/chat/ConversationMessage.jsx"},{"name":"Avatar","sourcePath":"components/core/Avatar.jsx"},{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Divider","sourcePath":"components/core/Divider.jsx"},{"name":"IconButton","sourcePath":"components/core/IconButton.jsx"},{"name":"Status","sourcePath":"components/core/Status.jsx"},{"name":"Alert","sourcePath":"components/feedback/Alert.jsx"},{"name":"EmptyState","sourcePath":"components/feedback/EmptyState.jsx"},{"name":"ErrorState","sourcePath":"components/feedback/ErrorState.jsx"},{"name":"Skeleton","sourcePath":"components/feedback/Skeleton.jsx"},{"name":"Toast","sourcePath":"components/feedback/Toast.jsx"},{"name":"Tooltip","sourcePath":"components/feedback/Tooltip.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"},{"name":"Listbox","sourcePath":"components/forms/Listbox.jsx"},{"name":"SearchInput","sourcePath":"components/forms/SearchInput.jsx"},{"name":"Select","sourcePath":"components/forms/Select.jsx"},{"name":"Textarea","sourcePath":"components/forms/Textarea.jsx"},{"name":"BrandSelector","sourcePath":"components/navigation/BrandSelector.jsx"},{"name":"NavItem","sourcePath":"components/navigation/NavItem.jsx"},{"name":"Sidebar","sourcePath":"components/navigation/Sidebar.jsx"},{"name":"TopBar","sourcePath":"components/navigation/TopBar.jsx"},{"name":"Dialog","sourcePath":"components/overlays/Dialog.jsx"},{"name":"Popover","sourcePath":"components/overlays/Popover.jsx"},{"name":"ActionCard","sourcePath":"components/surfaces/ActionCard.jsx"},{"name":"ActivityItem","sourcePath":"components/surfaces/ActivityItem.jsx"},{"name":"BrandCard","sourcePath":"components/surfaces/BrandCard.jsx"},{"name":"Card","sourcePath":"components/surfaces/Card.jsx"},{"name":"HistoryItem","sourcePath":"components/surfaces/HistoryItem.jsx"},{"name":"KnowledgeCard","sourcePath":"components/surfaces/KnowledgeCard.jsx"}],"sourceHashes":{"components/app/AppShell.jsx":"3735e26238a2","components/app/Hero.jsx":"b2f18663bbdd","components/app/Section.jsx":"ab7bc13fc815","components/chat/ChatComposer.jsx":"a74d03cbd16f","components/chat/ConversationMessage.jsx":"cbf592cf0c70","components/core/Avatar.jsx":"5d3c1c869a98","components/core/Badge.jsx":"14ee5ece0cab","components/core/Button.jsx":"17e93e3a45e9","components/core/Divider.jsx":"ccdd29941513","components/core/IconButton.jsx":"39d8b296ca1c","components/core/Status.jsx":"05376dd3c0fe","components/feedback/Alert.jsx":"d15b6f08bf78","components/feedback/EmptyState.jsx":"fea9b6a7a039","components/feedback/ErrorState.jsx":"155360faf3c9","components/feedback/Skeleton.jsx":"51f39dd8c8c3","components/feedback/Toast.jsx":"129edc8149e7","components/feedback/Tooltip.jsx":"5a73b001cffd","components/forms/Input.jsx":"2d95e511c131","components/forms/Listbox.jsx":"9d463992a3ad","components/forms/SearchInput.jsx":"2447d563919a","components/forms/Select.jsx":"dfe0501bc8fb","components/forms/Textarea.jsx":"c2d099893d81","components/navigation/BrandSelector.jsx":"da701600146b","components/navigation/NavItem.jsx":"567bd4005d84","components/navigation/Sidebar.jsx":"5094abf06f7b","components/navigation/TopBar.jsx":"75a869ac5184","components/overlays/Dialog.jsx":"52a674719d7b","components/overlays/Popover.jsx":"cc2eff043b8f","components/surfaces/ActionCard.jsx":"7ca86e3969f3","components/surfaces/ActivityItem.jsx":"57832a962d7d","components/surfaces/BrandCard.jsx":"485b8542c610","components/surfaces/Card.jsx":"b4adea501b9b","components/surfaces/HistoryItem.jsx":"b87d6c40d59a","components/surfaces/KnowledgeCard.jsx":"1b069771f0ff","ui_kits/atlas-web/ActivityScreen.jsx":"edfe17a3238b","ui_kits/atlas-web/BrandsScreen.jsx":"060ffa1ea83c","ui_kits/atlas-web/ChatScreen.jsx":"7ad2baf8b2ba","ui_kits/atlas-web/HomeScreen.jsx":"c3f1cb9c7773","ui_kits/atlas-web/IconRocket.jsx":"c49327286337","ui_kits/atlas-web/KnowledgeScreen.jsx":"82f1893639bd"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.ATLASDesignSystem_46b296 = window.ATLASDesignSystem_46b296 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/app/AppShell.jsx
try { (() => {
function AppShell({
  sidebar,
  topBar,
  children
}) {
  return React.createElement("div", {
    style: {
      display: "flex",
      minHeight: "100vh",
      background: "var(--color-bg)",
      fontFamily: "var(--font-body)"
    }
  }, sidebar, React.createElement("div", {
    style: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      minWidth: 0
    }
  }, topBar, React.createElement("div", {
    style: {
      flex: 1,
      padding: 32,
      maxWidth: 1180,
      margin: "0 auto",
      width: "100%"
    }
  }, children)));
}
Object.assign(__ds_scope, { AppShell });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/app/AppShell.jsx", error: String((e && e.message) || e) }); }

// components/app/Hero.jsx
try { (() => {
function Hero({
  title,
  subtitle,
  description,
  visual
}) {
  return React.createElement("div", {
    style: {
      background: "var(--color-surface)",
      border: "1px solid var(--color-border)",
      borderRadius: "var(--radius-xl)",
      padding: 32,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 24,
      overflow: "hidden",
      position: "relative"
    }
  }, React.createElement("div", {
    style: {
      maxWidth: 480
    }
  }, React.createElement("div", {
    style: {
      fontFamily: "var(--font-display)",
      fontSize: "var(--text-display)",
      fontWeight: 600,
      color: "var(--color-text-primary)",
      letterSpacing: "var(--tracking-heading)"
    }
  }, title), subtitle && React.createElement("div", {
    style: {
      fontSize: "var(--text-section)",
      color: "var(--color-text-secondary)",
      marginTop: 6,
      fontFamily: "var(--font-display)",
      fontWeight: 600
    }
  }, subtitle), description && React.createElement("div", {
    style: {
      fontSize: "var(--text-body)",
      color: "var(--color-text-muted)",
      marginTop: 10,
      lineHeight: "var(--leading-relaxed)"
    }
  }, description)), visual);
}
Object.assign(__ds_scope, { Hero });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/app/Hero.jsx", error: String((e && e.message) || e) }); }

// components/app/Section.jsx
try { (() => {
function Section({
  title,
  action,
  children
}) {
  return React.createElement("div", {
    style: {
      marginBottom: 32
    }
  }, React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 12
    }
  }, React.createElement("div", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 600,
      fontSize: "var(--text-section)",
      color: "var(--color-text-primary)"
    }
  }, title), action), children);
}
Object.assign(__ds_scope, { Section });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/app/Section.jsx", error: String((e && e.message) || e) }); }

// components/chat/ChatComposer.jsx
try { (() => {
function ChatComposer({
  value,
  onChange,
  onSend,
  placeholder = "Escribe tu pregunta..."
}) {
  return React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "flex-end",
      gap: 10,
      background: "var(--color-surface)",
      border: "1px solid var(--color-border)",
      borderRadius: "var(--radius-lg)",
      padding: 10
    }
  }, React.createElement("textarea", {
    value,
    onChange,
    placeholder,
    rows: 1,
    style: {
      flex: 1,
      resize: "none",
      border: "none",
      outline: "none",
      background: "transparent",
      color: "var(--color-text-primary)",
      fontFamily: "var(--font-body)",
      fontSize: "var(--text-body)",
      padding: "8px 6px",
      maxHeight: 120
    }
  }), React.createElement("button", {
    onClick: onSend,
    style: {
      background: "var(--color-primary)",
      color: "#fff",
      border: "none",
      width: 40,
      height: 40,
      borderRadius: "var(--radius-sm)",
      cursor: "pointer",
      flexShrink: 0,
      fontSize: 16
    }
  }, "↑"));
}
Object.assign(__ds_scope, { ChatComposer });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/chat/ChatComposer.jsx", error: String((e && e.message) || e) }); }

// components/chat/ConversationMessage.jsx
try { (() => {
function ConversationMessage({
  role = "assistant",
  children,
  time
}) {
  const isUser = role === "user";
  return React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      alignItems: isUser ? "flex-end" : "flex-start",
      gap: 4,
      marginBottom: 18
    }
  }, React.createElement("div", {
    style: {
      fontSize: "var(--text-metadata)",
      color: "var(--color-text-muted)",
      fontWeight: 600
    }
  }, isUser ? "Tú" : "ATLAS"), React.createElement("div", {
    style: {
      maxWidth: "78%",
      background: isUser ? "var(--color-primary)" : "var(--color-surface-elevated)",
      color: isUser ? "#fff" : "var(--color-text-primary)",
      border: isUser ? "none" : "1px solid var(--color-border)",
      borderRadius: "var(--radius-lg)",
      padding: "12px 16px",
      fontSize: "var(--text-body)",
      lineHeight: "var(--leading-relaxed)"
    }
  }, children), time && React.createElement("div", {
    style: {
      fontSize: "var(--text-metadata)",
      color: "var(--color-text-disabled)"
    }
  }, time));
}
Object.assign(__ds_scope, { ConversationMessage });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/chat/ConversationMessage.jsx", error: String((e && e.message) || e) }); }

// components/core/Avatar.jsx
try { (() => {
function Avatar({
  name = "",
  size = 36,
  src
}) {
  const initials = name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
  return React.createElement("div", {
    style: {
      width: size,
      height: size,
      borderRadius: "50%",
      background: "var(--color-primary)",
      color: "#fff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: size * 0.38,
      fontWeight: 600,
      fontFamily: "var(--font-display)",
      overflow: "hidden",
      flexShrink: 0
    }
  }, src ? React.createElement("img", {
    src,
    alt: name,
    style: {
      width: "100%",
      height: "100%",
      objectFit: "cover"
    }
  }) : initials);
}
Object.assign(__ds_scope, { Avatar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Avatar.jsx", error: String((e && e.message) || e) }); }

// components/core/Badge.jsx
try { (() => {
function Badge({
  tone = "neutral",
  children
}) {
  const tones = {
    neutral: {
      bg: "var(--color-surface-elevated)",
      fg: "var(--color-text-secondary)"
    },
    primary: {
      bg: "rgba(104,92,255,0.16)",
      fg: "var(--color-primary)"
    },
    success: {
      bg: "rgba(16,185,129,0.16)",
      fg: "var(--color-success)"
    },
    warning: {
      bg: "rgba(245,158,11,0.16)",
      fg: "var(--color-warning)"
    },
    error: {
      bg: "rgba(244,63,94,0.16)",
      fg: "var(--color-error)"
    },
    info: {
      bg: "rgba(34,211,238,0.16)",
      fg: "var(--color-cyan)"
    }
  };
  const t = tones[tone];
  return React.createElement("span", {
    style: {
      background: t.bg,
      color: t.fg,
      fontSize: "var(--text-metadata)",
      fontWeight: 600,
      padding: "3px 10px",
      borderRadius: "var(--radius-pill)",
      display: "inline-flex",
      alignItems: "center",
      gap: 6
    }
  }, children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function Button({
  variant = "primary",
  size = "md",
  icon,
  children,
  disabled,
  onClick,
  type = "button"
}) {
  const pad = size === "sm" ? "8px 14px" : size === "lg" ? "14px 22px" : "11px 18px";
  const base = {
    fontFamily: "var(--font-body)",
    fontSize: "var(--text-button)",
    fontWeight: 600,
    borderRadius: "var(--radius-sm)",
    padding: pad,
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    cursor: disabled ? "not-allowed" : "pointer",
    border: "1px solid transparent",
    transition: "background var(--motion-fast) var(--motion-ease),border-color var(--motion-fast) var(--motion-ease)",
    opacity: disabled ? 0.5 : 1,
    minHeight: 44
  };
  const variants = {
    primary: {
      background: "var(--color-primary)",
      color: "#fff"
    },
    secondary: {
      background: "transparent",
      color: "var(--color-text-primary)",
      borderColor: "var(--color-border)"
    },
    tertiary: {
      background: "transparent",
      color: "var(--color-primary)"
    },
    danger: {
      background: "var(--color-error)",
      color: "#fff"
    }
  };
  return React.createElement("button", {
    type,
    disabled,
    onClick,
    style: {
      ...base,
      ...variants[variant]
    }
  }, icon, children);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/Divider.jsx
try { (() => {
function Divider({
  spacing = 24
}) {
  return React.createElement("div", {
    style: {
      height: 1,
      background: "var(--color-border-subtle)",
      margin: spacing + "px 0"
    }
  });
}
Object.assign(__ds_scope, { Divider });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Divider.jsx", error: String((e && e.message) || e) }); }

// components/core/IconButton.jsx
try { (() => {
function IconButton({
  icon,
  label,
  active,
  onClick,
  size = 36
}) {
  return React.createElement("button", {
    onClick,
    "aria-label": label,
    title: label,
    style: {
      width: size,
      height: size,
      minWidth: 44 > size ? 44 : size,
      minHeight: 44 > size ? 44 : size,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "var(--radius-sm)",
      border: "1px solid " + (active ? "transparent" : "var(--color-border)"),
      background: active ? "var(--color-primary)" : "transparent",
      color: active ? "#fff" : "var(--color-text-secondary)",
      cursor: "pointer"
    }
  }, icon);
}
Object.assign(__ds_scope, { IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/IconButton.jsx", error: String((e && e.message) || e) }); }

// components/core/Status.jsx
try { (() => {
function Status({
  tone = "neutral",
  label
}) {
  const colors = {
    neutral: "var(--color-text-muted)",
    primary: "var(--color-primary)",
    success: "var(--color-success)",
    warning: "var(--color-warning)",
    error: "var(--color-error)",
    info: "var(--color-cyan)"
  };
  return React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 7,
      fontSize: "var(--text-secondary)",
      color: "var(--color-text-secondary)"
    }
  }, React.createElement("span", {
    style: {
      width: 8,
      height: 8,
      borderRadius: "50%",
      background: colors[tone],
      flexShrink: 0
    }
  }), label);
}
Object.assign(__ds_scope, { Status });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Status.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Alert.jsx
try { (() => {
function Alert({
  tone = "info",
  title,
  children
}) {
  const colors = {
    info: "var(--color-cyan)",
    success: "var(--color-success)",
    warning: "var(--color-warning)",
    error: "var(--color-error)"
  };
  return React.createElement("div", {
    style: {
      display: "flex",
      gap: 10,
      padding: "14px 16px",
      borderRadius: "var(--radius-md)",
      background: "var(--color-surface-elevated)",
      border: "1px solid " + colors[tone] + "33"
    }
  }, React.createElement("span", {
    style: {
      color: colors[tone],
      flexShrink: 0
    }
  }, "●"), React.createElement("div", null, title && React.createElement("div", {
    style: {
      fontWeight: 600,
      color: "var(--color-text-primary)",
      fontSize: "var(--text-body)",
      marginBottom: 2
    }
  }, title), React.createElement("div", {
    style: {
      fontSize: "var(--text-secondary)",
      color: "var(--color-text-secondary)"
    }
  }, children)));
}
Object.assign(__ds_scope, { Alert });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Alert.jsx", error: String((e && e.message) || e) }); }

// components/feedback/EmptyState.jsx
try { (() => {
function EmptyState({
  icon = "📄",
  title,
  description,
  action
}) {
  return React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      textAlign: "center",
      gap: 8,
      padding: "40px 24px",
      color: "var(--color-text-secondary)"
    }
  }, React.createElement("div", {
    style: {
      fontSize: 28,
      opacity: 0.6
    }
  }, icon), React.createElement("div", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 600,
      color: "var(--color-text-primary)",
      fontSize: "var(--text-card-title)"
    }
  }, title), description && React.createElement("div", {
    style: {
      fontSize: "var(--text-secondary)",
      maxWidth: 320
    }
  }, description), action);
}
Object.assign(__ds_scope, { EmptyState });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/EmptyState.jsx", error: String((e && e.message) || e) }); }

// components/feedback/ErrorState.jsx
try { (() => {
function ErrorState({
  title = "Algo salió mal",
  description,
  onRetry
}) {
  return React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      textAlign: "center",
      gap: 10,
      padding: "40px 24px"
    }
  }, React.createElement("div", {
    style: {
      fontSize: 28,
      color: "var(--color-error)"
    }
  }, "⚠"), React.createElement("div", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 600,
      color: "var(--color-text-primary)",
      fontSize: "var(--text-card-title)"
    }
  }, title), description && React.createElement("div", {
    style: {
      fontSize: "var(--text-secondary)",
      color: "var(--color-text-secondary)",
      maxWidth: 320
    }
  }, description), onRetry && React.createElement("button", {
    onClick: onRetry,
    style: {
      marginTop: 4,
      background: "var(--color-primary)",
      color: "#fff",
      border: "none",
      borderRadius: "var(--radius-sm)",
      padding: "10px 18px",
      fontSize: "var(--text-button)",
      fontWeight: 600,
      cursor: "pointer"
    }
  }, "Reintentar"));
}
Object.assign(__ds_scope, { ErrorState });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/ErrorState.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Skeleton.jsx
try { (() => {
function Skeleton({
  width = "100%",
  height = 16,
  radius = "var(--radius-sm)"
}) {
  return React.createElement("div", {
    style: {
      width,
      height,
      borderRadius: radius,
      background: "linear-gradient(90deg,var(--color-surface-elevated),var(--color-border),var(--color-surface-elevated))",
      backgroundSize: "200% 100%",
      animation: "atlas-skeleton 1.4s ease-in-out infinite"
    }
  });
}
Object.assign(__ds_scope, { Skeleton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Skeleton.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Toast.jsx
try { (() => {
function Toast({
  tone = "info",
  message,
  onClose
}) {
  const colors = {
    info: "var(--color-cyan)",
    success: "var(--color-success)",
    warning: "var(--color-warning)",
    error: "var(--color-error)"
  };
  return React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "12px 16px",
      borderRadius: "var(--radius-md)",
      background: "var(--color-surface-elevated)",
      border: "1px solid var(--color-border)",
      boxShadow: "var(--shadow-md)",
      minWidth: 260
    }
  }, React.createElement("span", {
    style: {
      width: 8,
      height: 8,
      borderRadius: "50%",
      background: colors[tone],
      flexShrink: 0
    }
  }), React.createElement("span", {
    style: {
      fontSize: "var(--text-body)",
      color: "var(--color-text-primary)",
      flex: 1
    }
  }, message), React.createElement("button", {
    onClick: onClose,
    style: {
      background: "none",
      border: "none",
      color: "var(--color-text-muted)",
      cursor: "pointer",
      fontSize: 16
    }
  }, "×"));
}
Object.assign(__ds_scope, { Toast });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Toast.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Tooltip.jsx
try { (() => {
function Tooltip({
  label,
  children
}) {
  const [show, setShow] = React.useState(false);
  return React.createElement("span", {
    style: {
      position: "relative",
      display: "inline-flex"
    },
    onMouseEnter: () => setShow(true),
    onMouseLeave: () => setShow(false)
  }, children, show && React.createElement("span", {
    style: {
      position: "absolute",
      bottom: "calc(100% + 8px)",
      left: "50%",
      transform: "translateX(-50%)",
      background: "var(--color-surface-elevated)",
      border: "1px solid var(--color-border)",
      color: "var(--color-text-primary)",
      fontSize: "var(--text-metadata)",
      padding: "5px 10px",
      borderRadius: "var(--radius-sm)",
      whiteSpace: "nowrap",
      boxShadow: "var(--shadow-sm)",
      zIndex: "var(--z-dropdown)"
    }
  }, label));
}
Object.assign(__ds_scope, { Tooltip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Tooltip.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
function Input({
  placeholder,
  value,
  onChange,
  type = "text",
  error,
  disabled
}) {
  return React.createElement("input", {
    type,
    placeholder,
    value,
    onChange,
    disabled,
    style: {
      width: "100%",
      height: 44,
      padding: "0 14px",
      borderRadius: "var(--radius-sm)",
      background: "var(--color-bg)",
      border: "1px solid " + (error ? "var(--color-error)" : "var(--color-border)"),
      color: "var(--color-text-primary)",
      fontFamily: "var(--font-body)",
      fontSize: "var(--text-body)",
      outline: "none",
      opacity: disabled ? 0.5 : 1
    }
  });
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Input.jsx", error: String((e && e.message) || e) }); }

// components/forms/Listbox.jsx
try { (() => {
function Listbox({
  items = [],
  selected,
  onSelect
}) {
  return React.createElement("div", {
    style: {
      background: "var(--color-surface-elevated)",
      border: "1px solid var(--color-border)",
      borderRadius: "var(--radius-md)",
      overflow: "hidden"
    }
  }, items.map(it => React.createElement("div", {
    key: it,
    onClick: () => onSelect && onSelect(it),
    style: {
      padding: "10px 14px",
      fontSize: "var(--text-body)",
      cursor: "pointer",
      background: it === selected ? "rgba(104,92,255,0.16)" : "transparent",
      color: it === selected ? "var(--color-primary)" : "var(--color-text-primary)"
    }
  }, it)));
}
Object.assign(__ds_scope, { Listbox });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Listbox.jsx", error: String((e && e.message) || e) }); }

// components/forms/SearchInput.jsx
try { (() => {
function SearchInput({
  placeholder = "Buscar...",
  value,
  onChange
}) {
  return React.createElement("div", {
    style: {
      position: "relative"
    }
  }, React.createElement("span", {
    style: {
      position: "absolute",
      left: 14,
      top: 0,
      bottom: 0,
      display: "flex",
      alignItems: "center",
      color: "var(--color-text-muted)",
      fontSize: 15
    }
  }, "⌕"), React.createElement("input", {
    placeholder,
    value,
    onChange,
    style: {
      width: "100%",
      height: 44,
      padding: "0 14px 0 38px",
      borderRadius: "var(--radius-sm)",
      background: "var(--color-surface)",
      border: "1px solid var(--color-border)",
      color: "var(--color-text-primary)",
      fontFamily: "var(--font-body)",
      fontSize: "var(--text-body)",
      outline: "none"
    }
  }));
}
Object.assign(__ds_scope, { SearchInput });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/SearchInput.jsx", error: String((e && e.message) || e) }); }

// components/forms/Select.jsx
try { (() => {
function Select({
  value,
  options = [],
  onChange
}) {
  return React.createElement("select", {
    value,
    onChange,
    style: {
      height: 44,
      padding: "0 12px",
      borderRadius: "var(--radius-sm)",
      background: "var(--color-surface)",
      border: "1px solid var(--color-border)",
      color: "var(--color-text-primary)",
      fontFamily: "var(--font-body)",
      fontSize: "var(--text-body)",
      outline: "none"
    }
  }, options.map(o => React.createElement("option", {
    key: o,
    value: o
  }, o)));
}
Object.assign(__ds_scope, { Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Select.jsx", error: String((e && e.message) || e) }); }

// components/forms/Textarea.jsx
try { (() => {
function Textarea({
  placeholder,
  value,
  onChange,
  rows = 4
}) {
  return React.createElement("textarea", {
    placeholder,
    value,
    onChange,
    rows,
    style: {
      width: "100%",
      padding: "12px 14px",
      borderRadius: "var(--radius-sm)",
      resize: "vertical",
      background: "var(--color-bg)",
      border: "1px solid var(--color-border)",
      color: "var(--color-text-primary)",
      fontFamily: "var(--font-body)",
      fontSize: "var(--text-body)",
      outline: "none"
    }
  });
}
Object.assign(__ds_scope, { Textarea });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Textarea.jsx", error: String((e && e.message) || e) }); }

// components/navigation/NavItem.jsx
try { (() => {
function NavItem({
  icon,
  label,
  active,
  onClick
}) {
  return React.createElement("div", {
    onClick,
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "10px 12px",
      borderRadius: "var(--radius-sm)",
      cursor: "pointer",
      background: active ? "rgba(104,92,255,0.16)" : "transparent",
      color: active ? "var(--color-primary)" : "var(--color-text-secondary)",
      fontSize: "var(--text-nav)",
      fontWeight: active ? 600 : 500
    }
  }, React.createElement("span", {
    style: {
      width: 18,
      display: "flex",
      justifyContent: "center"
    }
  }, icon), label);
}
Object.assign(__ds_scope, { NavItem });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/NavItem.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Sidebar.jsx
try { (() => {
function Sidebar({
  activeItem = "Inicio",
  items,
  footer,
  logoSrc = "assets/logo.svg"
}) {
  const defaultItems = [["house", "Inicio"], ["message-circle", "Conversar"], ["book-open", "Conocimiento"], ["building-2", "Marcas"], ["trending-up", "Actividad"]];
  const list = items || defaultItems.map(([ic, label]) => ({
    icon: ic,
    label
  }));
  return React.createElement("div", {
    style: {
      width: 220,
      minHeight: 600,
      background: "var(--color-navy-950,var(--color-bg))",
      borderRight: "1px solid var(--color-border)",
      display: "flex",
      flexDirection: "column",
      padding: 16,
      gap: 4
    }
  }, React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "6px 8px 20px"
    }
  }, React.createElement("img", {
    src: logoSrc,
    style: {
      height: 22,
      filter: "invert(1)"
    }
  }), React.createElement("span", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 600,
      fontSize: 16,
      letterSpacing: "var(--tracking-heading)",
      color: "var(--color-text-primary)"
    }
  }, "ATLAS")), list.map(it => React.createElement(__ds_scope.NavItem, {
    key: it.label,
    icon: it.icon,
    label: it.label,
    active: it.active != null ? it.active : it.label === activeItem,
    onClick: it.onClick
  })), React.createElement("div", {
    style: {
      flex: 1
    }
  }), footer);
}
Object.assign(__ds_scope, { Sidebar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Sidebar.jsx", error: String((e && e.message) || e) }); }

// components/navigation/TopBar.jsx
try { (() => {
function TopBar({
  brand = "General",
  onThemeToggle,
  userName = "Ana García"
}) {
  const label = brand === "General" ? "Trabajando en" : "Trabajando con";
  return React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "14px 24px",
      borderBottom: "1px solid var(--color-border-subtle)"
    }
  }, React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      fontSize: "var(--text-body)",
      color: "var(--color-text-secondary)"
    }
  }, label, React.createElement("span", {
    style: {
      color: "var(--color-text-primary)",
      fontWeight: 600
    }
  }, brand), React.createElement("span", {
    style: {
      color: "var(--color-text-muted)"
    }
  }, "▾")), React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 14
    }
  }, React.createElement("button", {
    onClick: onThemeToggle,
    style: {
      background: "none",
      border: "none",
      color: "var(--color-text-secondary)",
      cursor: "pointer",
      fontSize: 16
    }
  }, "☾"), React.createElement("div", {
    style: {
      width: 32,
      height: 32,
      borderRadius: "50%",
      background: "var(--color-primary)",
      color: "#fff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 13,
      fontWeight: 600
    }
  }, userName.split(" ").map(w => w[0]).slice(0, 2).join(""))));
}
Object.assign(__ds_scope, { TopBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/TopBar.jsx", error: String((e && e.message) || e) }); }

// components/overlays/Dialog.jsx
try { (() => {
function Dialog({
  open,
  title,
  description,
  children,
  onClose,
  actions
}) {
  if (!open) return null;
  return React.createElement("div", {
    style: {
      position: "fixed",
      inset: 0,
      background: "rgba(15,23,42,0.6)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: "var(--z-modal)"
    },
    onClick: onClose
  }, React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      background: "var(--color-surface-elevated)",
      border: "1px solid var(--color-border)",
      borderRadius: "var(--radius-xl)",
      padding: 24,
      width: 380,
      boxShadow: "var(--shadow-lg)"
    }
  }, React.createElement("div", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 600,
      fontSize: "var(--text-section)",
      color: "var(--color-text-primary)",
      marginBottom: 8
    }
  }, title), description && React.createElement("div", {
    style: {
      fontSize: "var(--text-body)",
      color: "var(--color-text-secondary)",
      marginBottom: 16
    }
  }, description), children, actions && React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "flex-end",
      gap: 10,
      marginTop: 18
    }
  }, actions)));
}
Object.assign(__ds_scope, { Dialog });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/overlays/Dialog.jsx", error: String((e && e.message) || e) }); }

// components/overlays/Popover.jsx
try { (() => {
function Popover({
  open,
  children,
  anchorStyle
}) {
  if (!open) return null;
  return React.createElement("div", {
    style: {
      position: "absolute",
      top: "calc(100% + 6px)",
      left: 0,
      minWidth: 220,
      background: "var(--color-surface-elevated)",
      border: "1px solid var(--color-border)",
      borderRadius: "var(--radius-md)",
      boxShadow: "var(--shadow-md)",
      padding: 6,
      zIndex: "var(--z-dropdown)",
      ...anchorStyle
    }
  }, children);
}
Object.assign(__ds_scope, { Popover });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/overlays/Popover.jsx", error: String((e && e.message) || e) }); }

// components/navigation/BrandSelector.jsx
try { (() => {
function BrandSelector({
  brands = ["General"],
  selected = "General",
  onSelect
}) {
  const [open, setOpen] = React.useState(false);
  return React.createElement("div", {
    style: {
      position: "relative",
      display: "inline-block"
    }
  }, React.createElement("button", {
    onClick: () => setOpen(!open),
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      background: "var(--color-surface-elevated)",
      border: "1px solid var(--color-border)",
      borderRadius: "var(--radius-sm)",
      padding: "8px 12px",
      color: "var(--color-text-primary)",
      fontSize: "var(--text-body)",
      cursor: "pointer"
    }
  }, selected, React.createElement("span", {
    style: {
      color: "var(--color-text-muted)"
    }
  }, "▾")), React.createElement(__ds_scope.Popover, {
    open
  }, React.createElement(__ds_scope.Listbox, {
    items: brands,
    selected,
    onSelect: v => {
      onSelect && onSelect(v);
      setOpen(false);
    }
  })));
}
Object.assign(__ds_scope, { BrandSelector });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/BrandSelector.jsx", error: String((e && e.message) || e) }); }

// components/surfaces/ActionCard.jsx
try { (() => {
function ActionCard({
  icon,
  tone = "primary",
  title,
  description,
  cta,
  onClick
}) {
  const colors = {
    primary: "var(--color-primary)",
    cyan: "var(--color-cyan)",
    success: "var(--color-success)",
    warning: "var(--color-warning)"
  };
  return React.createElement("div", {
    style: {
      background: "var(--color-surface)",
      border: "1px solid var(--color-border)",
      borderRadius: "var(--radius-lg)",
      padding: 20,
      display: "flex",
      flexDirection: "column",
      gap: 10
    }
  }, React.createElement("div", {
    style: {
      width: 36,
      height: 36,
      borderRadius: "var(--radius-sm)",
      background: "rgba(148,163,184,0.1)",
      color: colors[tone],
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, icon), React.createElement("div", {
    style: {
      fontFamily: "var(--font-display)",
      fontSize: "var(--text-card-title)",
      fontWeight: 600,
      color: "var(--color-text-primary)"
    }
  }, title), React.createElement("div", {
    style: {
      fontSize: "var(--text-secondary)",
      color: "var(--color-text-secondary)",
      lineHeight: "var(--leading-normal)"
    }
  }, description), React.createElement("button", {
    onClick,
    style: {
      marginTop: 4,
      alignSelf: "flex-start",
      background: "none",
      border: "none",
      color: colors[tone],
      fontSize: "var(--text-secondary)",
      fontWeight: 600,
      cursor: "pointer",
      padding: 0
    }
  }, cta));
}
Object.assign(__ds_scope, { ActionCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/surfaces/ActionCard.jsx", error: String((e && e.message) || e) }); }

// components/surfaces/ActivityItem.jsx
try { (() => {
function ActivityItem({
  icon,
  text,
  time,
  tone = "primary"
}) {
  const colors = {
    primary: "var(--color-primary)",
    cyan: "var(--color-cyan)",
    warning: "var(--color-warning)",
    success: "var(--color-success)"
  };
  return React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "10px 4px"
    }
  }, React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10
    }
  }, React.createElement("span", {
    style: {
      color: colors[tone]
    }
  }, icon), React.createElement("span", {
    style: {
      fontSize: "var(--text-body)",
      color: "var(--color-text-primary)"
    }
  }, text)), React.createElement("span", {
    style: {
      fontSize: "var(--text-metadata)",
      color: "var(--color-text-muted)",
      flexShrink: 0
    }
  }, time));
}
Object.assign(__ds_scope, { ActivityItem });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/surfaces/ActivityItem.jsx", error: String((e && e.message) || e) }); }

// components/surfaces/BrandCard.jsx
try { (() => {
function BrandCard({
  name,
  purpose,
  active,
  knowledgeCount,
  onClick
}) {
  return React.createElement("div", {
    onClick,
    style: {
      cursor: "pointer",
      background: active ? "rgba(104,92,255,0.1)" : "var(--color-surface)",
      border: "1px solid " + (active ? "var(--color-primary)" : "var(--color-border)"),
      borderRadius: "var(--radius-lg)",
      padding: 18,
      display: "flex",
      flexDirection: "column",
      gap: 6
    }
  }, React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    }
  }, React.createElement("span", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 600,
      fontSize: "var(--text-card-title)",
      color: "var(--color-text-primary)"
    }
  }, name), active && React.createElement("span", {
    style: {
      width: 8,
      height: 8,
      borderRadius: "50%",
      background: "var(--color-primary)"
    }
  })), React.createElement("div", {
    style: {
      fontSize: "var(--text-secondary)",
      color: "var(--color-text-secondary)"
    }
  }, purpose), knowledgeCount != null && React.createElement("div", {
    style: {
      fontSize: "var(--text-metadata)",
      color: "var(--color-text-muted)"
    }
  }, knowledgeCount + " recursos de conocimiento"));
}
Object.assign(__ds_scope, { BrandCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/surfaces/BrandCard.jsx", error: String((e && e.message) || e) }); }

// components/surfaces/Card.jsx
try { (() => {
function Card({
  children,
  padding = 24
}) {
  return React.createElement("div", {
    style: {
      background: "var(--color-surface)",
      border: "1px solid var(--color-border)",
      borderRadius: "var(--radius-lg)",
      padding
    }
  }, children);
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/surfaces/Card.jsx", error: String((e && e.message) || e) }); }

// components/surfaces/HistoryItem.jsx
try { (() => {
function HistoryItem({
  question,
  time,
  onOpen
}) {
  return React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "12px 4px",
      borderBottom: "1px solid var(--color-border-subtle)"
    }
  }, React.createElement("div", null, React.createElement("div", {
    style: {
      fontSize: "var(--text-body)",
      color: "var(--color-text-primary)"
    }
  }, question), React.createElement("div", {
    style: {
      fontSize: "var(--text-metadata)",
      color: "var(--color-text-muted)"
    }
  }, time)), React.createElement("button", {
    onClick: onOpen,
    style: {
      background: "var(--color-surface-elevated)",
      border: "1px solid var(--color-border)",
      color: "var(--color-text-secondary)",
      borderRadius: "var(--radius-sm)",
      padding: "6px 12px",
      fontSize: "var(--text-metadata)",
      cursor: "pointer"
    }
  }, "Abrir"));
}
Object.assign(__ds_scope, { HistoryItem });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/surfaces/HistoryItem.jsx", error: String((e && e.message) || e) }); }

// components/surfaces/KnowledgeCard.jsx
try { (() => {
function KnowledgeCard({
  title,
  type = "Documento",
  updated,
  onOpen
}) {
  return React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "12px 4px",
      borderBottom: "1px solid var(--color-border-subtle)"
    }
  }, React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10
    }
  }, React.createElement("span", {
    style: {
      color: "var(--color-cyan)"
    }
  }, "▤"), React.createElement("div", null, React.createElement("div", {
    style: {
      fontSize: "var(--text-body)",
      color: "var(--color-text-primary)"
    }
  }, title), React.createElement("div", {
    style: {
      fontSize: "var(--text-metadata)",
      color: "var(--color-text-muted)"
    }
  }, type + (updated ? " · " + updated : "")))), React.createElement("button", {
    onClick: onOpen,
    style: {
      background: "none",
      border: "none",
      color: "var(--color-cyan)",
      fontSize: "var(--text-secondary)",
      cursor: "pointer"
    }
  }, "Abrir"));
}
Object.assign(__ds_scope, { KnowledgeCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/surfaces/KnowledgeCard.jsx", error: String((e && e.message) || e) }); }

// ui_kits/atlas-web/ActivityScreen.jsx
try { (() => {
function ActivityScreen({
  brand,
  onNavigate
}) {
  const {
    Sidebar,
    TopBar,
    Card,
    ActivityItem,
    Section
  } = window.ATLASDesignSystem_46b296;
  const items = [["💬", 'Conversaste sobre "¿Qué contratos tengo con Acme?"', "Ahora", "primary"], ["🔍", 'Buscaste "contratos de servicio"', "Hace 8 min", "cyan"], ["✎", "Corregiste una respuesta de ATLAS", "Hace 25 min", "warning"], ["📖", "Abriste el Manual de bienvenida", "Hace 40 min", "cyan"], ["💬", 'Conversaste sobre "Resumen de RRHH"', "Hace 1 hora", "primary"]];
  return React.createElement(React.Fragment, null, React.createElement(Sidebar, {
    activeItem: "Actividad",
    logoSrc: "../../assets/logo.svg",
    items: window.AtlasUIKit.navItems("Actividad", onNavigate)
  }), React.createElement("div", {
    style: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      minWidth: 0
    }
  }, React.createElement(TopBar, {
    brand
  }), React.createElement("div", {
    style: {
      flex: 1,
      padding: 32,
      maxWidth: 1180,
      margin: "0 auto",
      width: "100%"
    }
  }, React.createElement("div", {
    style: {
      fontFamily: "var(--font-display)",
      fontSize: "var(--text-page-title)",
      fontWeight: 600,
      color: "var(--color-text-primary)",
      marginBottom: 6
    }
  }, "Actividad"), React.createElement("div", {
    style: {
      fontSize: 14,
      color: "var(--color-text-muted)",
      marginBottom: 20
    }
  }, "Actividad de esta sesión."), React.createElement(Section, {
    title: "Esta sesión"
  }, React.createElement(Card, null, items.map((it, i) => React.createElement(ActivityItem, {
    key: i,
    icon: it[0],
    text: it[1],
    time: it[2],
    tone: it[3]
  })))))));
}
window.AtlasUIKit = Object.assign(window.AtlasUIKit || {}, {
  ActivityScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/atlas-web/ActivityScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/atlas-web/BrandsScreen.jsx
try { (() => {
function BrandsScreen({
  brand,
  onSelect,
  onNavigate
}) {
  const {
    Sidebar,
    TopBar,
    BrandCard,
    Section
  } = window.ATLASDesignSystem_46b296;
  const brands = [{
    name: "General",
    purpose: "Contexto por defecto, sin marca específica.",
    count: 12
  }, {
    name: "Banco Machala",
    purpose: "Conocimiento y conversaciones del contexto Banco Machala.",
    count: 34
  }, {
    name: "Acme Corp",
    purpose: "Conocimiento y conversaciones del contexto Acme Corp.",
    count: 8
  }];
  return React.createElement(React.Fragment, null, React.createElement(Sidebar, {
    activeItem: "Marcas",
    logoSrc: "../../assets/logo.svg",
    items: window.AtlasUIKit.navItems("Marcas", onNavigate)
  }), React.createElement("div", {
    style: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      minWidth: 0
    }
  }, React.createElement(TopBar, {
    brand
  }), React.createElement("div", {
    style: {
      flex: 1,
      padding: 32,
      maxWidth: 1180,
      margin: "0 auto",
      width: "100%"
    }
  }, React.createElement("div", {
    style: {
      fontFamily: "var(--font-display)",
      fontSize: "var(--text-page-title)",
      fontWeight: 600,
      color: "var(--color-text-primary)",
      marginBottom: 16
    }
  }, "Marcas"), React.createElement(Section, {
    title: "Tus contextos de marca"
  }, React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(3,1fr)",
      gap: 16
    }
  }, brands.map(b => React.createElement(BrandCard, {
    key: b.name,
    name: b.name,
    purpose: b.purpose,
    knowledgeCount: b.count,
    active: b.name === brand,
    onClick: () => onSelect && onSelect(b.name)
  })))))));
}
window.AtlasUIKit = Object.assign(window.AtlasUIKit || {}, {
  BrandsScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/atlas-web/BrandsScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/atlas-web/ChatScreen.jsx
try { (() => {
function ChatScreen({
  brand,
  onNavigate
}) {
  const {
    Sidebar,
    TopBar,
    ConversationMessage,
    ChatComposer
  } = window.ATLASDesignSystem_46b296;
  const [messages, setMessages] = React.useState([{
    role: "user",
    text: "¿Qué contratos tengo con Acme?",
    time: "10:42"
  }, {
    role: "assistant",
    text: "Tienes 3 contratos activos con Acme Corp. El más reciente fue firmado en marzo de 2026 e incluye una cláusula de renovación automática a 12 meses.",
    time: "10:42"
  }, {
    role: "user",
    text: "¿Cuáles son las cláusulas más importantes?",
    time: "10:43"
  }, {
    role: "assistant",
    text: "Las cláusulas clave son: confidencialidad (sección 4), renovación automática (sección 7) y penalización por incumplimiento (sección 9).",
    time: "10:43"
  }]);
  const [value, setValue] = React.useState("");
  function send() {
    if (!value.trim()) return;
    setMessages(m => [...m, {
      role: "user",
      text: value,
      time: "ahora"
    }]);
    setValue("");
  }
  return React.createElement(React.Fragment, null, React.createElement(Sidebar, {
    activeItem: "Conversar",
    logoSrc: "../../assets/logo.svg",
    items: window.AtlasUIKit.navItems("Conversar", onNavigate)
  }), React.createElement("div", {
    style: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      minWidth: 0
    }
  }, React.createElement(TopBar, {
    brand
  }), React.createElement("div", {
    style: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      maxWidth: 760,
      margin: "0 auto",
      width: "100%",
      padding: "28px 32px"
    }
  }, React.createElement("div", {
    style: {
      flex: 1,
      overflowY: "auto"
    }
  }, messages.map((m, i) => React.createElement(ConversationMessage, {
    key: i,
    role: m.role,
    time: m.time
  }, m.text))), React.createElement(ChatComposer, {
    value,
    onChange: e => setValue(e.target.value),
    onSend: send,
    placeholder: "Escribe tu pregunta..."
  }))));
}
window.AtlasUIKit = Object.assign(window.AtlasUIKit || {}, {
  ChatScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/atlas-web/ChatScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/atlas-web/HomeScreen.jsx
try { (() => {
function HomeScreen({
  brand,
  onNavigate
}) {
  const {
    Sidebar,
    TopBar,
    Hero,
    Section,
    ActionCard,
    HistoryItem,
    KnowledgeCard,
    ActivityItem,
    Alert,
    Card
  } = window.ATLASDesignSystem_46b296;
  const {
    IconRocket
  } = window.AtlasUIKit;
  return React.createElement(React.Fragment, null, React.createElement(Sidebar, {
    activeItem: "Inicio",
    logoSrc: "../../assets/logo.svg",
    items: window.AtlasUIKit.navItems("Inicio", onNavigate),
    footer: React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 10
      }
    }, React.createElement("div", {
      style: {
        fontSize: 12,
        color: "var(--color-text-muted)",
        textTransform: "uppercase",
        letterSpacing: "0.08em"
      }
    }, "Trabajando en"), React.createElement("div", {
      style: {
        color: "var(--color-text-primary)",
        fontSize: 14,
        fontWeight: 600,
        marginBottom: 10
      }
    }, brand), React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        paddingTop: 10,
        borderTop: "1px solid var(--color-border-subtle)"
      }
    }, React.createElement("div", {
      style: {
        width: 32,
        height: 32,
        borderRadius: "50%",
        background: "var(--color-primary)",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 13,
        fontWeight: 600
      }
    }, "AG"), React.createElement("div", null, React.createElement("div", {
      style: {
        fontSize: 13,
        color: "var(--color-text-primary)"
      }
    }, "Ana García"), React.createElement("div", {
      style: {
        fontSize: 11,
        color: "var(--color-text-muted)"
      }
    }, "Facilitador"))))
  }), React.createElement("div", {
    style: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      minWidth: 0
    }
  }, React.createElement(TopBar, {
    brand
  }), React.createElement("div", {
    style: {
      flex: 1,
      padding: 32,
      maxWidth: 1180,
      margin: "0 auto",
      width: "100%"
    }
  }, React.createElement(Hero, {
    title: "Bienvenido a ATLAS",
    subtitle: "Tu asistente inteligente de conocimiento empresarial",
    description: "Conversa, busca conocimiento y trabaja con total privacidad en el contexto de tu marca.",
    visual: React.createElement(IconRocket, {
      size: 100
    })
  }), React.createElement("div", {
    style: {
      height: 28
    }
  }), React.createElement(Section, {
    title: "¿Qué quieres hacer hoy?"
  }, React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(4,1fr)",
      gap: 16
    }
  }, React.createElement(ActionCard, {
    icon: "💬",
    tone: "primary",
    title: "Conversar con ATLAS",
    description: "Haz preguntas, pide análisis y obtén respuestas útiles.",
    cta: "Iniciar conversación →",
    onClick: () => onNavigate("chat")
  }), React.createElement(ActionCard, {
    icon: "📖",
    tone: "cyan",
    title: "Explorar conocimiento",
    description: "Busca documentos, guías y recursos guardados.",
    cta: "Buscar conocimiento",
    onClick: () => onNavigate("knowledge")
  }), React.createElement(ActionCard, {
    icon: "🏢",
    tone: "primary",
    title: "Trabajar con otra marca",
    description: "Cambia de marca o crea un nuevo contexto.",
    cta: "Gestionar marcas",
    onClick: () => onNavigate("brands")
  }), React.createElement(ActionCard, {
    icon: "📈",
    tone: "warning",
    title: "Ver actividad",
    description: "Revisa la actividad reciente en esta sesión.",
    cta: "Ver actividad",
    onClick: () => onNavigate("activity")
  }))), React.createElement("div", {
    style: {
      height: 12
    }
  }), React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 24
    }
  }, React.createElement(Section, {
    title: "Continúa donde lo dejaste"
  }, React.createElement(Card, null, React.createElement(HistoryItem, {
    question: "¿Qué contratos tengo con Acme?",
    time: "Hace 15 minutos"
  }), React.createElement(HistoryItem, {
    question: "Dame un resumen de los documentos de RRHH",
    time: "Hace 1 hora"
  }), React.createElement(HistoryItem, {
    question: "¿Cuáles son las cláusulas más importantes?",
    time: "Hace 2 horas"
  }))), React.createElement(Section, {
    title: "Ejemplos para empezar"
  }, React.createElement(Card, null, ["¿Qué documentos tengo sobre finanzas?", "Resume los puntos clave del manual de ventas", "¿Cuáles son mis pendientes importantes?", "Explícame este documento en lenguaje simple"].map(q => React.createElement("div", {
    key: q,
    style: {
      padding: "10px 4px",
      fontSize: 14,
      color: "var(--color-cyan)",
      borderBottom: "1px solid var(--color-border-subtle)",
      cursor: "pointer"
    }
  }, q))))), React.createElement("div", {
    style: {
      height: 12
    }
  }), React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 24
    }
  }, React.createElement(Section, {
    title: "Conocimiento destacado"
  }, React.createElement(Card, null, React.createElement(KnowledgeCard, {
    title: "Manual de bienvenida",
    type: "Guía"
  }), React.createElement(KnowledgeCard, {
    title: "Política de gastos",
    type: "Documento"
  }), React.createElement(KnowledgeCard, {
    title: "Guía de procesos comerciales",
    type: "Documento"
  }))), React.createElement(Section, {
    title: "Actividad reciente · Esta sesión"
  }, React.createElement(Card, null, React.createElement(ActivityItem, {
    icon: "💬",
    text: 'Conversar sobre "¿Qué contratos tengo con Acme?"',
    time: "Ahora",
    tone: "primary"
  }), React.createElement(ActivityItem, {
    icon: "🔍",
    text: 'Buscaste "contratos de servicio"',
    time: "Hace 8 min",
    tone: "cyan"
  }), React.createElement(ActivityItem, {
    icon: "✎",
    text: "Corregiste una respuesta de ATLAS",
    time: "Hace 25 min",
    tone: "warning"
  })))), React.createElement("div", {
    style: {
      height: 20
    }
  }), React.createElement(Alert, {
    tone: "info"
  }, "ATLAS trabaja con aislamiento total por marca. Tu información está protegida y no se comparte."))));
}
window.AtlasUIKit = Object.assign(window.AtlasUIKit || {}, {
  HomeScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/atlas-web/HomeScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/atlas-web/IconRocket.jsx
try { (() => {
function IconRocket({
  size = 120
}) {
  return React.createElement("div", {
    style: {
      position: "relative",
      width: size * 2.4,
      height: size * 1.6,
      display: "flex",
      alignItems: "flex-end",
      justifyContent: "center",
      overflow: "hidden"
    }
  }, React.createElement("div", {
    style: {
      position: "absolute",
      inset: 0,
      background: "radial-gradient(circle at 50% 100%, rgba(104,92,255,0.25), transparent 60%)"
    }
  }), React.createElement("div", {
    style: {
      position: "absolute",
      bottom: size * 0.28,
      left: "50%",
      width: size * 2,
      height: 1,
      background: "var(--color-border)",
      transform: "translateX(-50%)",
      borderRadius: "50%"
    }
  }), React.createElement("img", {
    src: "../../assets/logo.svg",
    style: {
      height: size,
      filter: "invert(1) drop-shadow(0 0 24px rgba(104,92,255,0.5))",
      position: "relative",
      zIndex: 1
    }
  }));
}
window.AtlasUIKit = Object.assign(window.AtlasUIKit || {}, {
  IconRocket
});
window.AtlasUIKit.navItems = function (active, onNavigate) {
  const rows = [["🏠", "Inicio", "home"], ["💬", "Conversar", "chat"], ["📖", "Conocimiento", "knowledge"], ["🏢", "Marcas", "brands"], ["📈", "Actividad", "activity"]];
  return rows.map(([icon, label, route]) => ({
    icon,
    label,
    active: label === active,
    onClick: () => onNavigate && onNavigate(route)
  }));
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/atlas-web/IconRocket.jsx", error: String((e && e.message) || e) }); }

// ui_kits/atlas-web/KnowledgeScreen.jsx
try { (() => {
function KnowledgeScreen({
  brand,
  onNavigate
}) {
  const {
    Sidebar,
    TopBar,
    SearchInput,
    Card,
    KnowledgeCard,
    Section
  } = window.ATLASDesignSystem_46b296;
  const docs = [["Manual de bienvenida", "Guía"], ["Política de gastos", "Documento"], ["Guía de procesos comerciales", "Documento"], ["Contrato marco Acme Corp", "Contrato"], ["Plantilla de propuesta comercial", "Plantilla"], ["Reglamento interno de trabajo", "Documento"]];
  return React.createElement(React.Fragment, null, React.createElement(Sidebar, {
    activeItem: "Conocimiento",
    logoSrc: "../../assets/logo.svg",
    items: window.AtlasUIKit.navItems("Conocimiento", onNavigate)
  }), React.createElement("div", {
    style: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      minWidth: 0
    }
  }, React.createElement(TopBar, {
    brand
  }), React.createElement("div", {
    style: {
      flex: 1,
      padding: 32,
      maxWidth: 1180,
      margin: "0 auto",
      width: "100%"
    }
  }, React.createElement("div", {
    style: {
      fontFamily: "var(--font-display)",
      fontSize: "var(--text-page-title)",
      fontWeight: 600,
      color: "var(--color-text-primary)",
      marginBottom: 16
    }
  }, "Conocimiento"), React.createElement("div", {
    style: {
      maxWidth: 420,
      marginBottom: 24
    }
  }, React.createElement(SearchInput, {
    placeholder: "Buscar documentos, guías y recursos..."
  })), React.createElement(Section, {
    title: "Todos los recursos"
  }, React.createElement(Card, null, docs.map(([t, ty]) => React.createElement(KnowledgeCard, {
    key: t,
    title: t,
    type: ty
  })))))));
}
window.AtlasUIKit = Object.assign(window.AtlasUIKit || {}, {
  KnowledgeScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/atlas-web/KnowledgeScreen.jsx", error: String((e && e.message) || e) }); }

__ds_ns.AppShell = __ds_scope.AppShell;

__ds_ns.Hero = __ds_scope.Hero;

__ds_ns.Section = __ds_scope.Section;

__ds_ns.ChatComposer = __ds_scope.ChatComposer;

__ds_ns.ConversationMessage = __ds_scope.ConversationMessage;

__ds_ns.Avatar = __ds_scope.Avatar;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Divider = __ds_scope.Divider;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.Status = __ds_scope.Status;

__ds_ns.Alert = __ds_scope.Alert;

__ds_ns.EmptyState = __ds_scope.EmptyState;

__ds_ns.ErrorState = __ds_scope.ErrorState;

__ds_ns.Skeleton = __ds_scope.Skeleton;

__ds_ns.Toast = __ds_scope.Toast;

__ds_ns.Tooltip = __ds_scope.Tooltip;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Listbox = __ds_scope.Listbox;

__ds_ns.SearchInput = __ds_scope.SearchInput;

__ds_ns.Select = __ds_scope.Select;

__ds_ns.Textarea = __ds_scope.Textarea;

__ds_ns.BrandSelector = __ds_scope.BrandSelector;

__ds_ns.NavItem = __ds_scope.NavItem;

__ds_ns.Sidebar = __ds_scope.Sidebar;

__ds_ns.TopBar = __ds_scope.TopBar;

__ds_ns.Dialog = __ds_scope.Dialog;

__ds_ns.Popover = __ds_scope.Popover;

__ds_ns.ActionCard = __ds_scope.ActionCard;

__ds_ns.ActivityItem = __ds_scope.ActivityItem;

__ds_ns.BrandCard = __ds_scope.BrandCard;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.HistoryItem = __ds_scope.HistoryItem;

__ds_ns.KnowledgeCard = __ds_scope.KnowledgeCard;

})();
