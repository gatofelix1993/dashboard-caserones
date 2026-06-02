// ============================================================
// components/ModalRegistro.jsx — Modal para registrar intervención
// ============================================================
import { useState } from 'react';
import { Modal, Form, Button, Row, Col } from 'react-bootstrap';

export default function ModalRegistro({ polin, tipoInit, onClose, onSave }) {
  const [tipo, setTipo]             = useState(tipoInit || 'inspeccion');
  const [fecha, setFecha]           = useState(new Date().toISOString().split('T')[0]);
  const [responsable, setResp]      = useState('');
  const [notas, setNotas]           = useState('');
  const [validated, setValidated]   = useState(false);

  function handleSave(e) {
    e.preventDefault();
    if (!responsable.trim()) {
      setValidated(true);
      return;
    }
    onSave({ tipo, fecha, responsable, notas });
  }

  return (
    <Modal show onHide={onClose} centered className="scada-modal">
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="bi bi-clipboard-plus me-2" />
          Registrar Intervención — <span style={{ color: 'var(--accent-blue)' }}>{polin.id}</span>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form noValidate validated={validated} onSubmit={handleSave}>
          <Row className="g-3">
            <Col xs={12}>
              <Form.Group>
                <Form.Label>Tipo de intervención</Form.Label>
                <Form.Select value={tipo} onChange={e => setTipo(e.target.value)}>
                  <option value="inspeccion">Inspección Periódica</option>
                  <option value="reemplazo">Reemplazo</option>
                  <option value="correctivo">Mantenimiento Correctivo</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col xs={12} md={6}>
              <Form.Group>
                <Form.Label>Fecha</Form.Label>
                <Form.Control
                  type="date"
                  value={fecha}
                  onChange={e => setFecha(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col xs={12} md={6}>
              <Form.Group>
                <Form.Label>Responsable *</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Nombre del técnico..."
                  value={responsable}
                  onChange={e => setResp(e.target.value)}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  Ingrese el nombre del responsable.
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col xs={12}>
              <Form.Group>
                <Form.Label>Observaciones</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Observaciones técnicas..."
                  value={notas}
                  onChange={e => setNotas(e.target.value)}
                />
              </Form.Group>
            </Col>
          </Row>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onClose} className="btn-scada-outline">
          Cancelar
        </Button>
        <Button className="btn-scada-primary" onClick={handleSave}>
          <i className="bi bi-check-lg me-1" />
          Guardar Registro
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
